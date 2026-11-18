import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const meterSchema = z.object({
  label: z.string().describe("What is measured, as the code calls it: `available`, `elapsed`."),
  value: z.number().describe("The current reading. Drive it with ease() between two readings; the bar and the number follow."),
  max: z.number().describe("The right end of the track. Pick it so the limit sits well inside the track, not at an end."),
  min: z.number().default(0).describe("The left end of the track."),
  limit: z.number().optional().describe("The line the value must not cross, drawn as a tick across the track."),
  limitLabel: z.string().optional().describe("What the limit is called: `minimum`, `time limit`. Shown above the tick with its value."),
  breach: z
    .enum(["below", "above"])
    .default("below")
    .describe("Which side of the limit is the bad one: below for stock under a minimum, above for a time cap. The bar and the number turn red there."),
  unit: z.string().optional().describe("Written after every number: `s`, `units`."),
  decimals: z
    .number()
    .int()
    .min(0)
    .max(3)
    .default(0)
    .describe("Decimal places shown. The value is rounded, so an eased value reads as whole numbers by default."),
  side: z.enum(["left", "right"]).default("right").describe("Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type MeterProps = z.input<typeof meterSchema>;

const TRACK = 620;
const BAR = 26;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * One value moving against a limit: stock falling under its minimum, a
 * transaction filling toward its time cap. The bar turns red on the bad side
 * of the limit. Goes in World's `overlay`.
 */
export const Meter = (props: MeterProps) => {
  const { label, value, max, min, limit, limitLabel, breach, unit, decimals, side, appear } = meterSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const span = max - min || 1;
  const at = (reading: number) => clamp((reading - min) / span) * TRACK;
  const format = (reading: number) => `${reading.toFixed(decimals)}${unit ? ` ${unit}` : ""}`;
  // Judged on the value as shown, so a red number never reads as equal to the limit.
  const shown = Number(value.toFixed(decimals));
  const bad = limit !== undefined && (breach === "below" ? shown < limit : shown > limit);
  const color = bad ? theme.danger : theme.accent;
  const dim = { fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim };
  const tick = limit === undefined ? 0 : at(limit);
  // The limit label is centred on its tick, but kept inside the track near either end.
  const anchor = tick < TRACK * 0.2 ? "0%" : tick > TRACK * 0.8 ? "-100%" : "-50%";

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        padding: "24px 34px 22px",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      <div style={dim}>{label}</div>
      <div style={{ fontSize: 64, lineHeight: 1.15, color: bad ? theme.danger : theme.text, marginBottom: 14 }}>
        {value.toFixed(decimals)}
        {unit ? <span style={{ fontSize: 34, marginLeft: 14 }}>{unit}</span> : null}
      </div>
      <div style={{ position: "relative", width: TRACK, height: limit === undefined ? BAR : BAR + 46, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            position: "relative",
            width: TRACK,
            height: BAR,
            borderRadius: BAR / 2,
            overflow: "hidden",
            background: `color-mix(in srgb, ${theme.panelBorder} 70%, transparent)`,
          }}
        >
          <div style={{ width: at(value), height: "100%", background: color }} />
        </div>
        {limit === undefined ? null : (
          <>
            <div style={{ position: "absolute", left: tick - 2, bottom: -8, width: 4, height: BAR + 16, borderRadius: 2, background: theme.text }} />
            <div
              style={{
                position: "absolute",
                left: tick,
                top: 0,
                transform: `translateX(${anchor})`,
                whiteSpace: "nowrap",
                fontSize: 22,
                color: theme.text,
              }}
            >
              {limitLabel ? <span style={{ ...dim, fontSize: 22, marginRight: 10 }}>{limitLabel}</span> : null}
              {format(limit)}
            </div>
          </>
        )}
      </div>
      <div
        style={{ display: "flex", justifyContent: "space-between", width: TRACK, marginTop: 16, ...dim, fontFamily: theme.mono, fontWeight: 500, fontSize: 20 }}
      >
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
};
