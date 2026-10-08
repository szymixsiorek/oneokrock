const LRCLIB_API_GET = "https://lrclib.net/api/get";
const LRCLIB_API_SEARCH = "https://lrclib.net/api/search";

interface LyricsResult {
  plainLyrics: string | null;
  syncedLyrics: SyncedLine[] | null;
  source: string;
  error?: string;
}

export interface SyncedLine {
  time: number; // seconds
  text: string;
}

interface LrclibResult {
  trackName: string;
  artistName: string;
  duration: number;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────

const parseSyncedLyrics = (raw: string): SyncedLine[] => {
  const lines: SyncedLine[] = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s?(.*)$/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = parseInt(match[3].padEnd(3, "0"), 10);
      const time = mins * 60 + secs + ms / 1000;
      lines.push({ time, text: match[4] });
    }
  }
  return lines;
};

/** Clean title for search: strip track numbers, parenthetical info, brackets, common suffixes */
const cleanTitle = (title: string): string => {
  return title
    // Remove track number prefix like "01. ", "05 - ", "11 " (only once, at the start)
    .replace(/^\d{1,3}(?:\s*[.)\-–—:]\s*|\s+)(?=\S)/, "")
    // Remove everything in parentheses
    .replace(/\s*\([^)]*\)/g, "")
    // Remove everything in brackets
    .replace(/\s*\[[^\]]*\]/g, "")
    // Remove common dash-separated suffixes
    .replace(/\s*-\s*(Remastered|Live|Acoustic|Radio Edit|Official Audio|Official Video|Music Video|Japanese Ver\.|JP Ver\.|Lyric Video|Audio|MV)\s*$/gi, "")
    // Remove feat./featuring at end without parens
    .replace(/\s*(feat\.|featuring)\s+.+$/gi, "")
    .trim();
};

/** Split "Japanese Title / English Title" into parts */
const splitDualTitle = (title: string): string[] => {
  const parts = title.split(/\s*[\/／]\s*/).map((p) => p.trim()).filter((p) => p.length > 0);
  // Extra spelling variants help older songs whose titles are written differently in the database
  const variants = new Set<string>(parts.length > 1 ? parts : []);
  for (const p of [title, ...parts]) {
    variants.add(p.replace(/[-_~]+/g, " ").replace(/\s+/g, " ").trim()); // "20_20" -> "20 20"
    variants.add(p.replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim()); // drop punctuation
    variants.add(p.replace(/\s+/g, "")); // "Kimi Shidai" -> "KimiShidai"
  }
  variants.delete(title);
  return [...variants].filter((v) => v.length > 1);
};

/** Small delay to avoid hammering the API */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Parse duration string like "3:45" to seconds */
const parseDurationToSeconds = (dur: string | null | undefined): number | null => {
  if (!dur) return null;
  const parts = dur.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
};

/** Build a result from raw API data */
const buildResult = (data: LrclibResult): LyricsResult | null => {
  const syncedLyrics = data.syncedLyrics ? parseSyncedLyrics(data.syncedLyrics) : null;
  const plainLyrics = data.plainLyrics || null;
  if (!syncedLyrics && !plainLyrics) return null;
  return { plainLyrics, syncedLyrics, source: "lrclib" };
};

const NOT_FOUND: LyricsResult = {
  plainLyrics: null,
  syncedLyrics: null,
  source: "lrclib",
  error: "No lyrics found for this track.",
};

// ── Step 1: Strict GET ──────────────────────────────────────────────

const strictSearch = async (artist: string, title: string): Promise<LyricsResult | null> => {
  try {
    const params = new URLSearchParams({ artist_name: artist, track_name: title });
    const res = await fetch(`${LRCLIB_API_GET}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    return buildResult(data);
  } catch {
    return null;
  }
};

// ── Step 2: Fuzzy search with duration matching ─────────────────────

const fuzzySearch = async (
  artist: string,
  title: string,
  durationSec: number | null
): Promise<LyricsResult | null> => {
  try {
    const q = `${artist} ${title}`;
    const params = new URLSearchParams({ q });
    const res = await fetch(`${LRCLIB_API_SEARCH}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const results: LrclibResult[] = await res.json();
    if (!results.length) return null;

    // If we have a duration, prefer the closest match within 10s
    if (durationSec != null) {
      const match = results.find(
        (r) => Math.abs(r.duration - durationSec) <= 10
      );
      if (match) return buildResult(match);
    }

    // Otherwise take first result that has lyrics
    for (const r of results) {
      const result = buildResult(r);
      if (result) return result;
    }
    return null;
  } catch {
    return null;
  }
};

// ── Step 3: Broad search (title only) ───────────────────────────────

const broadSearch = async (
  title: string,
  durationSec: number | null
): Promise<LyricsResult | null> => {
  try {
    const params = new URLSearchParams({ q: title });
    const res = await fetch(`${LRCLIB_API_SEARCH}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const results: LrclibResult[] = await res.json();
    if (!results.length) return null;

    if (durationSec != null) {
      const match = results.find(
        (r) => Math.abs(r.duration - durationSec) <= 10
      );
      if (match) return buildResult(match);
    }

    for (const r of results) {
      const result = buildResult(r);
      if (result) return result;
    }
    return null;
  } catch {
    return null;
  }
};

// ── Step 2b: Romaji-tolerant search (older Japanese titles) ──────────

/** Normalise romaji so "Uchu Hikoshi", "Uchuhikoushi" and "Uchuuhikoushi" compare equal */
const romajiKey = (t: string) =>
  cleanTitle(t.replace(/^.*?\s-\s(?=[A-Za-z])/, "")) // drop "07 - " or "世間知らず - " prefixes
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/ou/g, "o")
    .replace(/([aeiou])\1+/g, "$1");

const romajiSearch = async (
  artist: string,
  title: string,
  durationSec: number | null
): Promise<LyricsResult | null> => {
  const key = romajiKey(title);
  const firstWord = title.split(/\s+/)[0];
  if (!key || !firstWord) return null;
  try {
    const params = new URLSearchParams({ q: `${artist} ${firstWord}` });
    const res = await fetch(`${LRCLIB_API_SEARCH}?${params}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const results: LrclibResult[] = await res.json();
    const artistKey = artist.toLowerCase().replace(/\s/g, "");
    const candidates = results.filter((r) => {
      if (!r.artistName.toLowerCase().replace(/\s/g, "").includes(artistKey)) return false;
      const k = romajiKey(r.trackName);
      return k === key || k.includes(key) || key.includes(k) && k.length > 3;
    });
    const ordered = durationSec != null
      ? [...candidates].sort((a, b) => Math.abs(a.duration - durationSec) - Math.abs(b.duration - durationSec))
      : candidates;
    for (const r of ordered) {
      const built = buildResult(r);
      if (built) return built;
    }
    return null;
  } catch {
    return null;
  }
};

// ── Step 0: Ranked search (prefer synced + Japanese version) ────────

const JP_CHARS = /[\u3040-\u30ff\u4e00-\u9fff]/;
const titleKey = (t: string) =>
  cleanTitle(t.replace(/\s+-\s+.*$/, "")).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Score a candidate: synced lyrics first, then the Japanese version, then duration match. */
export const scoreCandidate = (r: LrclibResult, wantedKey: string, durationSec: number | null): number => {
  if (titleKey(r.trackName) !== wantedKey) return -Infinity;
  if (!r.syncedLyrics && !r.plainLyrics) return -Infinity;
  const label = `${r.trackName} ${(r as { albumName?: string }).albumName ?? ""}`.toLowerCase();
  let score = 0;
  if (r.syncedLyrics) score += 100;
  if (JP_CHARS.test(r.syncedLyrics || r.plainLyrics || "")) score += 50;
  if (label.includes("international")) score -= 20;
  if (/live|tour/.test(label)) score -= 40;
  if (r.duration < 20) score -= 200; // broken entries
  if (durationSec != null) score -= Math.min(Math.abs(r.duration - durationSec), 30);
  return score;
};

export const pickBest = (results: LrclibResult[], title: string, durationSec: number | null) => {
  const key = titleKey(title);
  let best: LrclibResult | null = null;
  let bestScore = -Infinity;
  for (const r of results) {
    const s = scoreCandidate(r, key, durationSec);
    if (s > bestScore) { best = r; bestScore = s; }
  }
  return best;
};

const rankedSearch = async (artist: string, title: string, durationSec: number | null) => {
  const queries = [`${artist} ${title}`, `${artist} ${title} Japanese`];
  const all: LrclibResult[] = [];
  for (const q of queries) {
    try {
      const res = await fetch(`${LRCLIB_API_SEARCH}?${new URLSearchParams({ q })}`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) all.push(...(await res.json()));
    } catch { /* ignore */ }
  }
  const artistKey = artist.toLowerCase().replace(/\s/g, "");
  const best = pickBest(all.filter((r) => r.artistName.toLowerCase().replace(/\s/g, "").includes(artistKey)), title, durationSec);
  return best ? buildResult(best) : null;
};

// ── Main exported function ──────────────────────────────────────────

export const fetchLyrics = async (
  artist: string,
  title: string,
  duration?: string | null
): Promise<LyricsResult> => {
  try {
    const cleanedTitle = cleanTitle(title);
    const durationSec = parseDurationToSeconds(duration);
    const titleParts = splitDualTitle(cleanedTitle);

    let result = await rankedSearch(artist, cleanedTitle, durationSec);
    if (result?.syncedLyrics) return result;
    const plainFallback = result;

    // Step 1: Strict search with cleaned title
    result = await strictSearch(artist, cleanedTitle);
    if (result?.syncedLyrics) return result;
    if (result && !plainFallback) return result;
    if (plainFallback) return plainFallback;

    // If dual title (e.g. "完全感覚Dreamer / Kanzen Kankaku Dreamer"), try each part
    if (titleParts.length > 0) {
      for (const part of titleParts) {
        await delay(200);
        result = await strictSearch(artist, part);
        if (result) return result;
      }
    }

    // Step 2: Fuzzy search with artist + title
    await delay(300);
    result = await fuzzySearch(artist, cleanedTitle, durationSec);
    if (result) return result;

    // Try each dual-title part in fuzzy search
    if (titleParts.length > 0) {
      for (const part of titleParts) {
        await delay(200);
        result = await fuzzySearch(artist, part, durationSec);
        if (result) return result;
      }
    }

    await delay(200);
    result = await romajiSearch(artist, cleanedTitle, durationSec);
    if (result) return result;

    // Step 3: Broad search (title only, no artist)
    await delay(300);
    result = await broadSearch(cleanedTitle, durationSec);
    if (result) return result;

    if (titleParts.length > 0) {
      for (const part of titleParts) {
        await delay(200);
        result = await broadSearch(part, durationSec);
        if (result) return result;
      }
    }

    return NOT_FOUND;
  } catch (error) {
    console.error("Lyrics fetch error:", error);
    return NOT_FOUND;
  }
};
