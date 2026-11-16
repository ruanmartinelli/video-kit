import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Narration, Word } from "./narration";
import { theme } from "./theme";

type CaptionProps = {
  narration: Narration;
  /** Words shown at once. */
  wordsPerLine?: number;
};

const chunk = (words: Word[], size: number) =>
  Array.from({ length: Math.ceil(words.length / size) }, (_, i) =>
    words.slice(i * size, (i + 1) * size),
  );

export const Caption = ({ narration, wordsPerLine = 5 }: CaptionProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  const lines = chunk(narration.words, wordsPerLine);
  const line = lines.findLast((words) => words[0] !== undefined && words[0].startMs <= nowMs) ?? lines[0];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: "0.3em",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 52,
      }}
    >
      {line?.map((word) => (
        <span key={word.startMs} style={{ color: word.startMs <= nowMs ? theme.text : theme.textDim }}>
          {word.text}
        </span>
      ))}
    </div>
  );
};
