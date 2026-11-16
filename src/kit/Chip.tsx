import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const chipSchema = z.object({
  children: z.string().describe("A filename, a migration name, a `file:line`. One line."),
  tone: z.enum(["neutral", "added", "changed", "removed"]).default("neutral").describe("Color of the dot. Use it for what the change being shown did to the thing named."),
  caption: z.string().optional().describe("Small text above it that says what kind of thing it is: `migration`, `changed file`."),
  corner: z.enum(["top-left", "top-right"]).default("top-left"),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type ChipProps = z.input<typeof chipSchema>;

/** A small flat tag that names the file or migration on screen, so the viewer can go find it. Goes in World's `overlay`. */
export const Chip = (props: ChipProps) => {
  const { children, tone, caption, corner, appear } = chipSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 72,
        [corner === "top-left" ? "left" : "right"]: 96,
        opacity: appear,
        transform: `translateY(${(1 - appear) * -20}px)`,
      }}
    >
      {caption ? (
        <div style={{ marginBottom: 10, fontFamily: theme.sans, fontWeight: 600, fontSize: 22, color: theme.textDim }}>{caption}</div>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 24px",
          borderRadius: 12,
          background: theme.panel,
          border: `2px solid ${theme.panelBorder}`,
          fontFamily: theme.mono,
          fontWeight: 500,
          fontSize: 28,
          color: theme.text,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 7, background: tone === "neutral" ? theme.textDim : theme[tone] }} />
        {children}
      </div>
    </div>
  );
};
