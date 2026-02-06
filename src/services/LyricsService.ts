const LYRIST_API = "https://lyrist.vercel.app/api";

interface LyricsResult {
  lyrics: string | null;
  source: string | null;
  error?: string;
}

export const fetchLyrics = async (
  artist: string,
  title: string
): Promise<LyricsResult> => {
  try {
    // Clean title: remove feat. info, parentheses, etc.
    const cleanTitle = title
      .replace(/\s*\(feat\..*?\)/gi, "")
      .replace(/\s*feat\..*$/gi, "")
      .replace(/\s*\(.*?\)/g, "")
      .trim();

    const encodedTitle = encodeURIComponent(cleanTitle);
    const encodedArtist = encodeURIComponent(artist);

    const response = await fetch(
      `${LYRIST_API}/${encodedTitle}/${encodedArtist}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return { lyrics: null, source: null, error: "Lyrics not found" };
    }

    const data = await response.json();

    if (data.lyrics) {
      return {
        lyrics: data.lyrics,
        source: data.source || "Lyrist",
      };
    }

    return { lyrics: null, source: null, error: "Lyrics not available" };
  } catch (error) {
    console.error("Lyrics fetch error:", error);
    return {
      lyrics: null,
      source: null,
      error: "Failed to fetch lyrics",
    };
  }
};
