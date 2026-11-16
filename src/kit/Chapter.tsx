import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const chapterSchema = z.object({
  titles: z.array(z.string()).min(2).max(12).describe("One title per chapter, in order. Two to twelve."),
  current: z.number().int().min(0).describe("Index of the chapter on screen, from 0. Chapters before it show as done on the rail."),
  appear: unitSchema
    .default(1)
    .describe("The title card, centered over the scene: 0 = hidden, 1 = fully in. Bring it up for a few seconds at the start of each chapter."),
  rail: z.boolean().default(true).describe("A thin segmented rail along the bottom edge, one segment per chapter. It stays on whatever `appear` is."),
});

type ChapterProps = z.input<typeof chapterSchema>;

const RAIL_BOTTOM = 32;
const RAIL_HEIGHT = 8;

/**
 * Where a long video is: a title card at the start of each chapter, and a thin
 * progress rail along the bottom edge that stays on screen, below the
 * captions. Goes in World's `overlay`.
 */
export const Chapter = (props: ChapterProps) => {
  const { titles, current: requested, appear, rail } = chapterSchema.parse(props);
  const current = Math.min(requested, titles.length - 1);

  return (
    <>
      {appear > 0 ? (
        // A veil over the scene, like Manifest: the system stays visible behind the card.
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            opacity: appear,
            background: `color-mix(in srgb, ${theme.background} 78%, transparent)`,
          }}
        >
          <div style={{ fontFamily: theme.mono, fontWeight: 500, fontSize: 28, color: theme.accent, transform: `translateY(${(1 - appear) * 12}px)` }}>
            chapter {current + 1} of {titles.length}
          </div>
          <div
            style={{
              maxWidth: 1400,
              textAlign: "center",
              fontFamily: theme.sans,
              fontWeight: 600,
              fontSize: 72,
              lineHeight: 1.15,
              color: theme.text,
              transform: `translateY(${(1 - appear) * 20}px)`,
            }}
          >
            {titles[current]}
          </div>
        </div>
      ) : null}
      {rail ? (
        // Below Caption's line (which starts 84 from the bottom), so the two never meet.
        <div style={{ position: "absolute", left: 96, right: 96, bottom: RAIL_BOTTOM, height: RAIL_HEIGHT, display: "flex", gap: 8 }}>
          {titles.map((title, index) => (
            <span
              key={`${index} ${title}`}
              style={{
                flex: 1,
                borderRadius: RAIL_HEIGHT / 2,
                background: index < current ? theme.textDim : index === current ? theme.accent : `color-mix(in srgb, ${theme.textDim} 30%, transparent)`,
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};
