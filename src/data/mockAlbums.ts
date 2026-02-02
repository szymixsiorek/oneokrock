export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  releaseDate: string;
  editionType: "Japanese" | "International" | "Deluxe";
  description: string;
  accentColor: string;
  tracks: Track[];
}

export interface Track {
  id: string;
  title: string;
  trackNumber: number;
  duration: string;
  artist: string;
  lyricsLanguage: "JA" | "EN" | "Mixed";
  isHiddenTrack: boolean;
  featuredArtist?: string;
}

export const mockAlbums: Album[] = [
  {
    id: "ambitions-jp",
    title: "Ambitions",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    releaseDate: "2017-01-11",
    editionType: "Japanese",
    description: "The seventh studio album featuring a blend of rock anthems and emotional ballads. The Japanese edition includes exclusive tracks like '20/20' and 'Always Coming Back'.",
    accentColor: "#ff0033",
    tracks: [
      { id: "amb-1", title: "Introduction: Where idiot should not be", trackNumber: 1, duration: "0:50", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false },
      { id: "amb-2", title: "Ambitions", trackNumber: 2, duration: "3:35", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "amb-3", title: "We are", trackNumber: 3, duration: "3:44", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "amb-4", title: "Take what you want", trackNumber: 4, duration: "3:28", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false, featuredArtist: "5 Seconds of Summer" },
      { id: "amb-5", title: "20/20", trackNumber: 5, duration: "3:46", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "amb-6", title: "Always Coming Back", trackNumber: 6, duration: "4:15", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "amb-7", title: "One Way Ticket", trackNumber: 7, duration: "3:31", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "amb-8", title: "Listen", trackNumber: 8, duration: "4:08", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false, featuredArtist: "Avril Lavigne" },
      { id: "amb-9", title: "Lost in Tonight", trackNumber: 9, duration: "3:52", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "amb-10", title: "I was King", trackNumber: 10, duration: "4:22", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "amb-11", title: "Start Again", trackNumber: 11, duration: "4:47", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
    ],
  },
  {
    id: "35xxxv-jp",
    title: "35xxxv",
    coverUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=600&fit=crop",
    releaseDate: "2015-02-11",
    editionType: "Japanese",
    description: "The breakthrough sixth studio album marking their international expansion. Features powerful anthems and the hidden track that fans have come to love.",
    accentColor: "#fbbf24",
    tracks: [
      { id: "35-1", title: "3xxxv5", trackNumber: 1, duration: "1:15", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-2", title: "Take Me to the Top", trackNumber: 2, duration: "3:22", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "35-3", title: "Cry Out", trackNumber: 3, duration: "3:56", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "35-4", title: "Mighty Long Fall", trackNumber: 4, duration: "5:15", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-5", title: "Heartache", trackNumber: 5, duration: "5:36", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-6", title: "Suddenly", trackNumber: 6, duration: "3:36", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-7", title: "Decision", trackNumber: 7, duration: "4:02", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-8", title: "Paper Planes", trackNumber: 8, duration: "4:09", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false },
      { id: "35-9", title: "Memories", trackNumber: 9, duration: "3:34", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-10", title: "Good Goodbye", trackNumber: 10, duration: "4:01", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-11", title: "One by One", trackNumber: 11, duration: "4:30", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "35-12", title: "Fight the Night", trackNumber: 12, duration: "3:55", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: true },
    ],
  },
  {
    id: "eye-of-the-storm-jp",
    title: "Eye of the Storm",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=600&fit=crop",
    releaseDate: "2019-02-13",
    editionType: "Japanese",
    description: "The eighth studio album showcasing a more polished pop-rock sound. Japanese version includes 'Can't Wait' as an exclusive track.",
    accentColor: "#06b6d4",
    tracks: [
      { id: "eots-1", title: "Eye of the Storm", trackNumber: 1, duration: "4:28", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "eots-2", title: "Stand Out Fit In", trackNumber: 2, duration: "4:09", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "eots-3", title: "Grow Old Die Young", trackNumber: 3, duration: "3:30", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "eots-4", title: "Wasted Nights", trackNumber: 4, duration: "4:07", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "eots-5", title: "In the Stars", trackNumber: 5, duration: "3:58", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false, featuredArtist: "Kiiara" },
      { id: "eots-6", title: "Head High", trackNumber: 6, duration: "4:03", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "eots-7", title: "Can't Wait", trackNumber: 7, duration: "3:45", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "eots-8", title: "Push Back", trackNumber: 8, duration: "3:23", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "eots-9", title: "Change", trackNumber: 9, duration: "4:15", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "eots-10", title: "The Last Time", trackNumber: 10, duration: "3:58", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
    ],
  },
  {
    id: "luxury-disease-jp",
    title: "Luxury Disease",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=600&fit=crop",
    releaseDate: "2022-09-09",
    editionType: "Japanese",
    description: "The ninth studio album blending their signature rock sound with modern production. Features 'Vandalize' from the Komi Can't Communicate anime.",
    accentColor: "#a855f7",
    tracks: [
      { id: "ld-1", title: "Save Yourself", trackNumber: 1, duration: "3:12", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "ld-2", title: "Vandalize", trackNumber: 2, duration: "3:26", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "ld-3", title: "Renegades", trackNumber: 3, duration: "3:52", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "ld-4", title: "Wonder", trackNumber: 4, duration: "3:21", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "ld-5", title: "Prove", trackNumber: 5, duration: "3:08", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "ld-6", title: "Mad World", trackNumber: 6, duration: "3:45", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "ld-7", title: "Free Them", trackNumber: 7, duration: "3:58", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false, featuredArtist: "Teddy Swims" },
      { id: "ld-8", title: "Let Me Let You Go", trackNumber: 8, duration: "4:02", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "ld-9", title: "Your Tears Are Mine", trackNumber: 9, duration: "4:15", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "ld-10", title: "Neon", trackNumber: 10, duration: "3:33", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
    ],
  },
  {
    id: "zankyo-reference",
    title: "残響リファレンス",
    coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=600&fit=crop",
    releaseDate: "2011-10-05",
    editionType: "Japanese",
    description: "Zankyo Reference - The fourth studio album showcasing their earlier, more aggressive rock sound with powerful Japanese lyrics.",
    accentColor: "#ef4444",
    tracks: [
      { id: "zr-1", title: "Answer is Near", trackNumber: 1, duration: "4:02", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "zr-2", title: "Re:make", trackNumber: 2, duration: "3:58", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false },
      { id: "zr-3", title: "完全感覚Dreamer", trackNumber: 3, duration: "4:15", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false },
      { id: "zr-4", title: "Clock Strikes", trackNumber: 4, duration: "4:08", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "zr-5", title: "キミシダイ列車", trackNumber: 5, duration: "3:45", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "zr-6", title: "Pierce", trackNumber: 6, duration: "4:22", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "zr-7", title: "じぶんROCK", trackNumber: 7, duration: "3:55", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "zr-8", title: "C.h.a.o.s.m.y.t.h", trackNumber: 8, duration: "4:10", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false },
      { id: "zr-9", title: "Nobody's Home", trackNumber: 9, duration: "5:02", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "zr-10", title: "Ending Story??", trackNumber: 10, duration: "4:35", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
    ],
  },
  {
    id: "jinsei-boku",
    title: "人生×僕＝",
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=600&fit=crop",
    releaseDate: "2013-03-06",
    editionType: "Japanese",
    description: "Jinsei x Boku = (Life x Me =) - The fifth studio album representing their artistic peak in the pre-international era.",
    accentColor: "#22c55e",
    tracks: [
      { id: "jb-1", title: "Introduction ~Where idiot should not be~", trackNumber: 1, duration: "1:20", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "jb-2", title: "Deeper Deeper", trackNumber: 2, duration: "3:48", artist: "ONE OK ROCK", lyricsLanguage: "Mixed", isHiddenTrack: false },
      { id: "jb-3", title: "Nothing Helps", trackNumber: 3, duration: "3:35", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "jb-4", title: "Be the Light", trackNumber: 4, duration: "5:15", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "jb-5", title: "The Beginning", trackNumber: 5, duration: "5:02", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "jb-6", title: "Clock Strikes", trackNumber: 6, duration: "4:18", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "jb-7", title: "Ending Story??", trackNumber: 7, duration: "4:32", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "jb-8", title: "The Same As...", trackNumber: 8, duration: "4:45", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
      { id: "jb-9", title: "Juvenile", trackNumber: 9, duration: "4:08", artist: "ONE OK ROCK", lyricsLanguage: "JA", isHiddenTrack: false },
      { id: "jb-10", title: "All Mine", trackNumber: 10, duration: "4:22", artist: "ONE OK ROCK", lyricsLanguage: "EN", isHiddenTrack: false },
    ],
  },
];

export const getAlbumById = (id: string): Album | undefined => {
  return mockAlbums.find((album) => album.id === id);
};
