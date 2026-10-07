export type AlbumColor = {
  h: number;
  s: number;
  l: number;
};

export const DEFAULT_ALBUM_COLOR: AlbumColor = { h: 348, s: 100, l: 50 };

const rgbToHsl = (red: number, green: number, blue: number): AlbumColor => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    if (max === g) h = 60 * ((b - r) / delta + 2);
    if (max === b) h = 60 * ((r - g) / delta + 4);
  }

  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const colorFromHex = (value: string | null): AlbumColor => {
  if (!value) return DEFAULT_ALBUM_COLOR;
  const hex = value.trim().replace("#", "");
  const normalized = hex.length === 3
    ? hex.split("").map((character) => character + character).join("")
    : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return DEFAULT_ALBUM_COLOR;

  return rgbToHsl(
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  );
};

export const extractCoverColor = (coverUrl: string): Promise<AlbumColor> => (
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        reject(new Error("Canvas unavailable"));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

      for (let index = 0; index < pixels.length; index += 16) {
        const alpha = pixels[index + 3];
        if (alpha < 200) continue;

        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const brightest = Math.max(r, g, b);
        const darkest = Math.min(r, g, b);
        if (brightest < 28 || darkest > 238) continue;

        const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
        const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        bucket.count += 1;
        buckets.set(key, bucket);
      }

      const ranked = [...buckets.values()].map((bucket) => {
        const r = bucket.r / bucket.count;
        const g = bucket.g / bucket.count;
        const b = bucket.b / bucket.count;
        const hsl = rgbToHsl(r, g, b);
        const brightnessFit = 1 - Math.min(Math.abs(hsl.l - 55) / 55, 0.75);
        const score = bucket.count * (0.35 + hsl.s / 100) * brightnessFit;
        return { hsl, score };
      }).sort((a, b) => b.score - a.score);

      const selected = ranked[0]?.hsl;
      if (!selected) {
        reject(new Error("No representative color found"));
        return;
      }

      resolve({
        h: selected.h,
        s: Math.max(55, Math.min(selected.s, 92)),
        l: Math.max(46, Math.min(selected.l, 62)),
      });
    };
    image.onerror = () => reject(new Error("Cover could not be sampled"));
    image.src = coverUrl;
  })
);

