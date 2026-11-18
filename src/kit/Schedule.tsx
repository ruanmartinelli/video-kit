import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const scheduleRowSchema = z.object({
  label: z.string().describe("Which schedule this is: `before`, `after`, a job name."),
  everyMinutes: z.number().positive().describe("Minutes between runs. 60 is hourly, 1440 is daily."),
  tone: z.enum(["neutral", "added", "changed", "removed"]).default("neutral").describe("neutral for the schedule as it was; the rest mark what the change did."),
  progress: unitSchema.default(1).describe("How much of the window has played, left to right. Drive with ease(); the run count climbs with it."),
});

export const scheduleSchema = z.object({
  rows: z.array(scheduleRowSchema).min(1).describe("One strip per schedule, on the same clock. Two rows compare before and after."),
  windowMinutes: z.number().positive().default(360).describe("How much time the strips cover. Pick one where the sparsest row still shows a few runs: 6 hours for hourly against every five minutes."),
  title: z.string().optional().describe("The schedule entry's name, as it is written in the code."),
  side: z.enum(["left", "right"]).default("right").describe("Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type ScheduleProps = z.input<typeof scheduleSchema>;

const TRACK = 600;
const LABEL = 170;
const COUNT = 150;

const span = (minutes: number) => (minutes % 1440 === 0 ? `${minutes / 1440} d` : minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`);

/**
 * When a job runs, as ticks on a strip of time. Two strips on the same clock
 * show what a schedule change means in runs. Goes in World's `overlay`.
 */
export const Schedule = (props: ScheduleProps) => {
  const { rows, windowMinutes, title, side, appear } = scheduleSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const dim = { fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim };

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
      {rows.map((row) => {
        const color = row.tone === "neutral" ? theme.textDim : theme[row.tone];
        const runs = Math.floor(windowMinutes / row.everyMinutes);
        const played = row.progress * windowMinutes;
        const shown = Array.from({ length: runs }, (_, run) => run * row.everyMinutes).filter((minute) => minute < played);
        return (
          <div key={row.label} style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: LABEL, ...dim }}>{row.label}</span>
            <div style={{ position: "relative", width: TRACK, height: 38, borderBottom: `2px solid ${theme.panelBorder}` }}>
              {shown.map((minute) => (
                <span key={minute} style={{ position: "absolute", left: (minute / windowMinutes) * TRACK, bottom: 0, width: 3, height: 28, background: color }} />
              ))}
            </div>
            <span style={{ width: COUNT, textAlign: "right", fontSize: 25, color: row.tone === "neutral" ? theme.textDim : color }}>
              {shown.length} {shown.length === 1 ? "run" : "runs"}
            </span>
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", marginLeft: LABEL, width: TRACK, ...dim, fontSize: 20 }}>
        <span>0</span>
        <span>{span(windowMinutes)}</span>
      </div>
    </div>
  );
};
