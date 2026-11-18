import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const barSchema = z.object({
  label: z.string().describe("What the bar is, under it: `before`, `after`, `p99`."),
  value: z.number().min(0).describe("Its size. Every bar is drawn to scale against the largest."),
  tone: z
    .enum(["neutral", "accent", "danger", "added", "changed", "removed"])
    .default("neutral")
    .describe("neutral for the baseline; added/changed/removed for what a change did; accent or danger to point at one."),
});

export const barsSchema = z.object({
  bars: z.array(barSchema).min(2).max(6).describe("The values to compare, left to right. Two to six."),
  unit: z.string().optional().describe("Read after each value: `lines`, `ms`, `queries`."),
  title: z.string().optional().describe("What is measured, above the bars: `lines in checkout()`."),
  progress: unitSchema.default(1).describe("How far the bars have grown from zero. Drive with ease()."),
  side: z.enum(["left", "right"]).default("right").describe("Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type BarsProps = z.input<typeof barsSchema>;

const HEIGHT = 380;
const BAR = 96;
const COLUMN = 150;
const MIN_BAR = 6;

const format = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 1 });

/**
 * A few values as bars on one scale: `40 lines before, 3 after`. Use it when
 * the size of a difference is the point. Goes in World's `overlay`.
 */
export const Bars = (props: BarsProps) => {
  const { bars, unit, title, progress, side, appear } = barsSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const largest = Math.max(...bars.map((bar) => bar.value));

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        padding: "24px 30px 22px",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      {title ? <div style={{ fontSize: 27, color: theme.text }}>{title}</div> : null}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", height: HEIGHT + 44, borderBottom: `2px solid ${theme.panelBorder}` }}>
        {bars.map((bar, index) => {
          const color = bar.tone === "neutral" ? theme.textDim : theme[bar.tone];
          const full = bar.value > 0 ? Math.max(MIN_BAR, (bar.value / largest) * HEIGHT) : 0;
          const counted = bar.value * progress;
          return (
            <div key={`${index} ${bar.label}`} style={{ width: COLUMN, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26, color: bar.tone === "neutral" ? theme.text : color, opacity: progress, whiteSpace: "nowrap" }}>
                {format(Number.isInteger(bar.value) ? Math.round(counted) : counted)}
                {unit ? <span style={{ fontSize: 20, color: theme.textDim }}> {unit}</span> : null}
              </span>
              <span style={{ width: BAR, height: full * progress, background: color, borderRadius: "6px 6px 0 0" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {bars.map((bar, index) => (
          <span
            key={`${index} ${bar.label}`}
            style={{ width: COLUMN, textAlign: "center", fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim }}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
};
