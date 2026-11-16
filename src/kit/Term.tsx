import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const termSchema = z.object({
  term: z.string().describe("The word as the codebase uses it: `idempotent`, `tenant`, `outbox`."),
  meaning: z.string().describe("One short line a newcomer can hold onto: `safe to run twice, same result`."),
  corner: z.enum(["bottom-left", "bottom-right"]).default("bottom-left").describe("Which bottom corner it pins to. Pick the one the 3D subject is not in."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Keep it up while the thing it names is on screen."),
});

type TermProps = z.input<typeof termSchema>;

/**
 * A word and what it means, pinned in a bottom corner above the captions while
 * the thing it names is on screen. For viewers new to a codebase. Goes in
 * World's `overlay`.
 */
export const Term = (props: TermProps) => {
  const { term, meaning, corner, appear } = termSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        // Caption's line runs from 84 to about 150 from the bottom; this sits clear above it.
        bottom: 190,
        [corner === "bottom-left" ? "left" : "right"]: 96,
        maxWidth: 620,
        padding: "16px 24px 18px",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        borderLeft: `6px solid ${theme.accent}`,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 20}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontFamily: theme.mono, fontWeight: 500, fontSize: 30, color: theme.accent }}>{term}</span>
      <span style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.text }}>{meaning}</span>
    </div>
  );
};
