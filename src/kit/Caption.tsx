import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { theme } from "./theme";
import type { Timeline, Word } from "./timeline";

export const captionSchema = z.object({
  wordsPerLine: z.number().int().min(1).default(7).describe("Words shown at once."),
});

type CaptionProps = z.input<typeof captionSchema> & { timeline: Timeline };

const chunk = (words: Word[], size: number) =>
  Array.from({ length: Math.ceil(words.length / size) }, (_, i) =>
    words.slice(i * size, (i + 1) * size),
  );

/** Word-synced subtitles for the beat being spoken. Goes in World's `overlay`. */
export const Caption = ({ timeline, ...props }: CaptionProps) => {
  const { wordsPerLine } = captionSchema.parse(props);
  const frame = useCurrentFrame();

  const beat = timeline.beats.findLast((b) => b.from <= frame);
  if (!beat) {
    return null;
  }

  const nowMs = ((frame - beat.from) / timeline.fps) * 1000;
  const lines = chunk(beat.words, wordsPerLine);
  const line = lines.findLast((words) => words[0] !== undefined && words[0].startMs <= nowMs) ?? lines[0];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 84,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: "0.3em",
        fontFamily: theme.sans,
        fontWeight: 600,
        fontSize: 50,
        textShadow: `0 2px 18px ${theme.background}`,
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
