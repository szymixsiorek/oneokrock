import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("login"),
    email: z.string().email().max(254),
    password: z.string().min(6).max(512),
  }),
  z.object({ action: z.literal("access") }),
  z.object({
    action: z.literal("createAlbum"),
    album: z.object({
      title: z.string().trim().min(1).max(255),
      description: z.string().max(5000).nullable(),
      edition_type: z.enum(["Japanese", "International", "Deluxe"]),
      release_type: z.enum(["Album", "Single"]),
      release_date: z.string().date().nullable(),
      cover_url: z.string().url().nullable(),
      accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    }),
  }),
  z.object({
    action: z.literal("createUpload"),
    bucket: z.enum(["covers", "music"]),
    path: z.string().min(1).max(1000).refine((value) => !value.includes("..")),
  }),
  z.object({
    action: z.literal("createTracks"),
    tracks: z.array(z.object({
      album_id: z.string().uuid(),
      title: z.string().min(1).max(500),
      track_number: z.number().int().positive(),
      duration: z.string().max(20),
      artist: z.string().min(1).max(255),
      mp3_url: z.string().url(),
      lyrics_language: z.enum(["JA", "EN", "Mixed"]),
    })).min(1).max(100),
  }),
  z.object({ action: z.literal("deleteAlbum"), albumId: z.string().uuid() }),
]);

const slugify = (title: string) => title
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "") || "release";

const storagePath = (publicUrl: string | null, bucket: string) => {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : decodeURIComponent(publicUrl.slice(index + marker.length));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) return json({ error: "Server configuration error." }, 500);

  let parsed: z.infer<typeof ActionSchema>;
  try {
    const result = ActionSchema.safeParse(await req.json());
    if (!result.success) return json({ error: "Invalid request." }, 400);
    parsed = result.data;
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (parsed.action === "login") {
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await authClient.auth.signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    });
    if (error || !data.session || !data.user) return json({ error: "Invalid email or password." }, 401);

    const { data: role } = await service
      .from("user_roles")
      .select("id")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) return json({ error: "Administrator access required." }, 403);

    return json({ session: data.session });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized." }, 401);

  const token = authHeader.slice(7);
  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string") return json({ error: "Unauthorized." }, 401);

  const { data: role } = await service
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return json({ error: "Administrator access required." }, 403);

  // Every admin action requires a session upgraded with a verified TOTP code.
  if (claimsData?.claims?.aal !== "aal2") {
    return json({ error: "Two-factor verification required." }, 403);
  }

  if (parsed.action === "access") return json({ allowed: true });

  if (parsed.action === "createUpload") {
    const { data, error } = await service.storage.from(parsed.bucket).createSignedUploadUrl(parsed.path);
    if (error) return json({ error: "Could not prepare file upload." }, 500);
    return json(data);
  }

  if (parsed.action === "createAlbum") {
    const baseSlug = slugify(parsed.album.title);
    let slug = baseSlug;
    const { data: existing } = await service.from("albums").select("id").eq("slug", slug).maybeSingle();
    if (existing) slug = `${baseSlug}-${Date.now().toString(36)}`;
    const { data, error } = await service.from("albums").insert({ ...parsed.album, slug }).select().single();
    if (error) return json({ error: "Could not create release." }, 500);
    return json(data);
  }

  if (parsed.action === "createTracks") {
    const { data, error } = await service.from("tracks").insert(parsed.tracks).select();
    if (error) return json({ error: "Could not create tracks." }, 500);
    return json(data);
  }

  const { data: album, error: albumError } = await service
    .from("albums")
    .select("cover_url, tracks(mp3_url)")
    .eq("id", parsed.albumId)
    .single();
  if (albumError) return json({ error: "Release not found." }, 404);

  const musicPaths = (album.tracks ?? [])
    .map((track: { mp3_url: string | null }) => storagePath(track.mp3_url, "music"))
    .filter((path: string | null): path is string => Boolean(path));
  const coverPath = storagePath(album.cover_url, "covers");
  if (musicPaths.length) await service.storage.from("music").remove(musicPaths);
  if (coverPath) await service.storage.from("covers").remove([coverPath]);

  const { error } = await service.from("albums").delete().eq("id", parsed.albumId);
  if (error) return json({ error: "Could not delete release." }, 500);
  return json({ deleted: true });
});