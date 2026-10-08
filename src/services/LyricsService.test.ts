import { describe, it, expect } from "vitest";
import { pickBest } from "./LyricsService";

const entry = (o: Partial<{ trackName: string; duration: number; plainLyrics: string | null; syncedLyrics: string | null }>) => ({
  trackName: "Dystopia", artistName: "ONE OK ROCK", duration: 190, plainLyrics: null, syncedLyrics: null, ...o,
});

describe("lyrics ranking", () => {
  it("prefers synced lyrics over plain-only", () => {
    const plain = entry({ plainLyrics: "夢を" });
    const synced = entry({ syncedLyrics: "[00:01.00] hello" });
    expect(pickBest([plain, synced], "Dystopia", null)).toBe(synced);
  });

  it("prefers the Japanese version when both are synced", () => {
    const en = entry({ syncedLyrics: "[00:01.00] hello" });
    const jp = entry({ trackName: "Dystopia - Japanese Version", syncedLyrics: "[00:01.00] 夢を" });
    expect(pickBest([en, jp], "Dystopia", null)).toBe(jp);
  });
});
