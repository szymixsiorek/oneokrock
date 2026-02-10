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
    // Remove track number prefix like "01. " or "05. "
    .replace(/^\d{1,2}\.\s*/, "")
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
  const parts = title.split(/\s*[\/／]\s*/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
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

    // Step 1: Strict search with cleaned title
    let result = await strictSearch(artist, cleanedTitle);
    if (result) return result;

    // If dual title (e.g. "完全感覚Dreamer / Kanzen Kankaku Dreamer"), try each part
    if (titleParts.length > 1) {
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
    if (titleParts.length > 1) {
      for (const part of titleParts) {
        await delay(200);
        result = await fuzzySearch(artist, part, durationSec);
        if (result) return result;
      }
    }

    // Step 3: Broad search (title only, no artist)
    await delay(300);
    result = await broadSearch(cleanedTitle, durationSec);
    if (result) return result;

    if (titleParts.length > 1) {
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
