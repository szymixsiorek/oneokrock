import { useEffect, useState, type CSSProperties } from "react";
import { extractCoverColor, type AlbumColor } from "@/lib/coverColor";

export const usePlayingCoverTheme = (coverUrl: string | null | undefined): CSSProperties => {
  const [sample, setSample] = useState<{ url: string; color: AlbumColor } | null>(null);

  useEffect(() => {
    if (!coverUrl) return;
    let cancelled = false;
    extractCoverColor(coverUrl).then((color) => {
      if (!cancelled) setSample({ url: coverUrl, color });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [coverUrl]);

  const color = sample?.url === coverUrl ? sample?.color : undefined;
  return {
    "--player-accent": color ? `${color.h} ${color.s}% ${color.l}%` : undefined,
    "--player-on-accent": color && color.l > 58 ? "var(--background)" : "var(--foreground)",
  } as CSSProperties;
};