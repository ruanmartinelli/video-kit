import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const proportionSchema = z.object({
  part: z.number().min(0).describe("How many have it: the 33 in `33 of 100`."),
  total: z.number().positive().describe("How many there are in all: the 100 in `33 of 100`."),
  label: z.string().optional().describe("What the part is, read after the numbers: `have a transcript`."),
  cells: z
    .number()
    .int()
    .min(10)
    .max(100)
    .default(100)
    .describe(
      "Dots in the grid, drawn 10 per row: 100 is one dot per percent, 10 a single row. The filled share is rounded to whole dots, and is at least one when `part` is above zero.",
    ),
  tone: z.enum(["accent", "danger", "added"]).default("accent").describe("Color of the filled dots and the number."),
  progress: unitSchema.default(1).describe("How many of the filled dots are in, one by one. Drive with ease()."),
  side: z.enum(["left", "right"]).default("right").describe("Pair with the CameraRig shot's `shift` to move the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type ProportionProps = z.input<typeof proportionSchema>;

const PER_ROW = 10;
const DOT = 30;
const GAP = 12;

const format = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 1 });

/**
 * A share drawn as a grid of dots: `33 of 100 calls have a transcript`. One
 * dot is one item, or one in every `total / cells`. Goes in World's `overlay`.
 */
export const Proportion = (props: ProportionProps) => {
  const { part, total, label, cells, tone, progress, side, appear } = proportionSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const share = Math.min(1, part / total);
  const filled = part > 0 ? Math.max(1, Math.round(share * cells)) : 0;
  const lit = Math.round(progress * filled);
  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const color = theme[tone];

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        padding: "26px 32px 32px",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, fontFamily: theme.mono, fontWeight: 500 }}>
        <span style={{ fontSize: 64, color }}>{format(part)}</span>
        <span style={{ fontSize: 32, color: theme.textDim }}>of {format(total)}</span>
      </div>
      {label ? <div style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 28, color: theme.text, maxWidth: PER_ROW * (DOT + GAP) }}>{label}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${PER_ROW}, ${DOT}px)`, gap: GAP, marginTop: 14 }}>
        {Array.from({ length: cells }, (_, cell) => (
          <span
            key={cell}
            style={{
              width: DOT,
              height: DOT,
              borderRadius: DOT / 2,
              boxSizing: "border-box",
              background: cell < lit ? color : "transparent",
              border: `2px solid ${cell < lit ? color : theme.panelBorder}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
