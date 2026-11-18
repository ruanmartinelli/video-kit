import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const outcomeSchema = z.object({
  name: z.string().describe("Who or what is tried: a role, an input, a caller."),
  before: z.string().describe("The answer before the change. One or two words: `blocked`, `$1,000.00`."),
  after: z.string().describe("The answer after it."),
  filled: z
    .number()
    .min(0)
    .max(2)
    .default(2)
    .describe("How much of the row is in: 0 = name only, 1 = `before` is in, 2 = `after` is in. Add two ease() calls. A row whose answers differ turns red as `after` arrives."),
});

export const outcomesSchema = z.object({
  rows: z.array(outcomeSchema).min(1).describe("The same cases, tried before and after the change. Keep it to five or fewer."),
  heading: z.string().default("who asks").describe("What the names are: `who asks`, `input`, `caller`."),
  side: z.enum(["left", "right"]).default("right").describe("Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type OutcomesProps = z.input<typeof outcomesSchema>;

const WIDTH = 760;
const ANSWER = 150;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * A scoreboard for behaviour that changed: the same cases answered before and
 * after. In the 3D world each case is a labelled Packet sent through the
 * changed node twice. Goes in World's `overlay`.
 */
export const Outcomes = (props: OutcomesProps) => {
  const { rows, heading, side, appear } = outcomesSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const head = { fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim };
  const answer = { width: ANSWER, fontSize: 25 };

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        width: WIDTH,
        boxSizing: "border-box",
        borderRadius: 14,
        overflow: "hidden",
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      <div style={{ display: "flex", padding: "18px 28px", borderBottom: `2px solid ${theme.panelBorder}`, ...head }}>
        <span style={{ flex: 1 }}>{heading}</span>
        <span style={{ width: ANSWER }}>before</span>
        <span style={{ width: ANSWER }}>after</span>
      </div>
      {rows.map((row) => {
        const beforeIn = clamp(row.filled);
        const afterIn = clamp(row.filled - 1);
        const flipped = row.before !== row.after ? afterIn : 0;
        return (
          <div
            key={row.name}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "17px 28px",
              background: `color-mix(in srgb, ${theme.danger} ${12 * flipped}%, transparent)`,
              boxShadow: `inset ${5 * flipped}px 0 0 ${theme.danger}`,
            }}
          >
            <span style={{ flex: 1, fontSize: 27, color: `color-mix(in srgb, ${theme.danger} ${100 * flipped}%, ${theme.text})` }}>{row.name}</span>
            <span style={{ ...answer, opacity: beforeIn, color: theme.textDim }}>{row.before}</span>
            <span style={{ ...answer, opacity: afterIn, color: flipped > 0 ? theme.danger : theme.text }}>{row.after}</span>
          </div>
        );
      })}
    </div>
  );
};
