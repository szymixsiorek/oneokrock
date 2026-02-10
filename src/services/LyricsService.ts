const LRCLIB_API = "https://lrclib.net/api/get";

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

const cleanTitle = (title: string): string => {
  return title
    // Remove track number prefix like "01. " or "05. "
    .replace(/^\d{1,2}\.\s*/, "")
    // Remove feat. info in parens
    .replace(/\s*\(feat\..*?\)/gi, "")
    // Remove feat. at end
    .replace(/\s*feat\..*$/gi, "")
    // Remove parenthetical content (Remastered, Live, Japanese Ver., etc.)
    .replace(/\s*\(.*?\)/g, "")
    // Remove bracketed content
    .replace(/\s*\[.*?\]/g, "")
    // Remove common suffixes
    .replace(/\s*-?\s*(Remastered|Live|Acoustic|Japanese Ver\.|JP Ver\.)\s*$/gi, "")
    .trim();
};

export const fetchLyrics = async (
  artist: string,
  title: string
): Promise<LyricsResult> => {
  try {
    const clean = cleanTitle(title);
    const params = new URLSearchParams({
      artist_name: artist,
      track_name: clean,
    });

    const response = await fetch(`${LRCLIB_API}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return { plainLyrics: null, syncedLyrics: null, source: "lrclib", error: "No lyrics found for this track." };
    }

    const data = await response.json();

    const syncedLyrics = data.syncedLyrics ? parseSyncedLyrics(data.syncedLyrics) : null;
    const plainLyrics = data.plainLyrics || null;

    if (!syncedLyrics && !plainLyrics) {
      return { plainLyrics: null, syncedLyrics: null, source: "lrclib", error: "No lyrics found for this track." };
    }

    return { plainLyrics, syncedLyrics, source: "lrclib" };
  } catch (error) {
    console.error("Lyrics fetch error:", error);
    return {
      plainLyrics: null,
      syncedLyrics: null,
      source: "lrclib",
      error: "No lyrics found for this track.",
    };
  }
};
