/**
 * audioProxy.ts
 * Routes audio through Cloudflare Worker proxy to hide Supabase URLs.
 * Falls back to direct URL gracefully if proxy is misconfigured.
 */

const PROXY_BASE = (import.meta.env.VITE_AUDIO_PROXY_URL as string | undefined)?.replace(/\/$/, "");

interface ProxyResult {
  proxyUrl: string;
  expiresAt: number;
}

// Cache tokens so we don't fetch a new one for every play event
const tokenCache = new Map<string, ProxyResult>();

/**
 * Returns a proxied audio URL for playback.
 * If the proxy is not configured, returns the original URL as a fallback.
 */
export async function getProxiedAudioUrl(supabaseUrl: string): Promise<string> {
  // ── Guard: proxy not configured ────────────────────────────────────────
  if (!PROXY_BASE || PROXY_BASE === "undefined" || PROXY_BASE === "") {
    console.warn(
      "[audioProxy] VITE_AUDIO_PROXY_URL is not set. " +
      "Playing directly from Supabase (no DRM protection). " +
      "Set this variable in Lovable → Project Settings → Environment Variables."
    );
    return supabaseUrl;
  }

  // ── Cache hit ───────────────────────────────────────────────────────────
  const now = Math.floor(Date.now() / 1000);
  const cached = tokenCache.get(supabaseUrl);
  if (cached && cached.expiresAt - now > 300) {
    return cached.proxyUrl;
  }

  // ── Fetch token from worker ─────────────────────────────────────────────
  const tokenEndpoint = `${PROXY_BASE}/token?url=${encodeURIComponent(supabaseUrl)}`;
  console.log("[audioProxy] Fetching token from:", tokenEndpoint);

  const res = await fetch(tokenEndpoint, {
    credentials: "omit", // Worker is on different origin, cookies not needed
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[audioProxy] Token fetch failed: HTTP ${res.status} — ${text}`);
  }

  const data: ProxyResult = await res.json();

  if (!data.proxyUrl) {
    throw new Error("[audioProxy] Worker returned no proxyUrl");
  }

  tokenCache.set(supabaseUrl, data);
  console.log("[audioProxy] Got proxy URL, expires at:", new Date(data.expiresAt * 1000).toISOString());
  return data.proxyUrl;
}
