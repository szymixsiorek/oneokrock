import { useLayoutEffect, useRef } from "react";

interface FittedLyricLineProps {
  text: string;
  active?: boolean;
  onSeek?: () => void;
  activeRef?: React.RefObject<HTMLParagraphElement>;
}

export const FittedLyricLine = ({ text, active = false, onSeek, activeRef }: FittedLyricLineProps) => {
  const lineRef = useRef<HTMLParagraphElement | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const line = lineRef.current;
    const content = textRef.current;
    if (!line || !content) return;
    const fit = () => {
      const baseSize = Number.parseFloat(getComputedStyle(line).getPropertyValue("--lyric-base-size"));
      content.style.fontSize = `${baseSize}px`;
      const naturalWidth = content.getBoundingClientRect().width;
      if (naturalWidth > line.clientWidth) {
        content.style.fontSize = `${baseSize * (line.clientWidth - 2) / naturalWidth}px`;
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(line);
    let mounted = true;
    document.fonts.ready.then(() => { if (mounted) fit(); });
    return () => { mounted = false; observer.disconnect(); };
  }, [text, active]);

  return (
    <p
      ref={(element) => {
        lineRef.current = element;
        if (activeRef) activeRef.current = element;
      }}
      className={`fullscreen-lyric-line ${active ? "is-active" : ""} ${onSeek ? "cursor-pointer" : ""}`}
      onClick={onSeek}
      role={onSeek ? "button" : undefined}
      tabIndex={onSeek ? 0 : undefined}
      onKeyDown={(event) => {
        if (onSeek && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSeek();
        }
      }}
    >
      <span ref={textRef} className="inline-block whitespace-nowrap">{text || "♪"}</span>
    </p>
  );
};