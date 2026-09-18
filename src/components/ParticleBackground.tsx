import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

const ParticleBackground = () => {
  const [init, setInit] = useState(false);
  const [albumHue, setAlbumHue] = useState<number | null>(null);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  useEffect(() => {
    const handleAlbumTheme = (event: Event) => {
      const customEvent = event as CustomEvent<{ hue?: number }>;
      const hue = customEvent.detail?.hue;
      setAlbumHue(Number.isFinite(hue) ? hue ?? null : null);
    };

    const handleAlbumThemeReset = () => setAlbumHue(null);
    window.addEventListener("album-theme-change", handleAlbumTheme);
    window.addEventListener("album-theme-reset", handleAlbumThemeReset);

    return () => {
      window.removeEventListener("album-theme-change", handleAlbumTheme);
      window.removeEventListener("album-theme-reset", handleAlbumThemeReset);
    };
  }, []);

  const particleColors = albumHue === null
    ? ["#ff0033", "#fbbf24", "#06b6d4"]
    : [
        `hsl(${albumHue}, 88%, 58%)`,
        `hsl(${(albumHue + 24) % 360}, 82%, 62%)`,
        `hsl(${(albumHue + 336) % 360}, 72%, 54%)`,
      ];

  const linkColor = albumHue === null
    ? "#ff0033"
    : `hsl(${albumHue}, 88%, 58%)`;

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: particleColors,
        },
        links: {
          color: linkColor,
          distance: 150,
          enable: true,
          opacity: 0.1,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: true,
          speed: 0.8,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 1200,
          },
          value: 60,
        },
        opacity: {
          value: { min: 0.1, max: 0.5 },
          animation: {
            enable: true,
            speed: 0.5,
            minimumValue: 0.1,
          },
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
          animation: {
            enable: true,
            speed: 2,
            minimumValue: 0.5,
          },
        },
      },
      detectRetina: true,
    }),
    [linkColor, particleColors]
  );

  if (!init) return null;

  return (
    <Particles
      key={albumHue ?? "default"}
      id="tsparticles"
      options={options}
      className="fixed inset-0 -z-10"
    />
  );
};

export default ParticleBackground;
