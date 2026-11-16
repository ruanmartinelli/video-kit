import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

const toneSchema = z.enum(["neutral", "added", "danger"]);

export const timelineEventSchema = z.object({
  at: z.number().describe("When it happened, in the same unit as `window`: minutes since midnight, seconds since start."),
  label: z.string().optional().describe("A word or two over the marker: `retry`, `paid`. Leave it off on most events; labels that would overlap stack upward."),
  tone: toneSchema.default("neutral").describe("neutral for an event that did nothing useful, added for one that mattered, danger for one that failed."),
});

export const timelineTickSchema = z.object({
  at: z.number().describe("Where on the axis, in the same unit as `window`."),
  label: z.string().describe("What the axis says there: `09:00`, `13:00`."),
});

export const eventTimelineSchema = z.object({
  events: z.array(timelineEventSchema).min(1).describe("Everything that happened to one record, in any order."),
  window: z.tuple([z.number(), z.number()]).describe("The stretch of time the axis covers, `[start, end]`, in the unit of `at`."),
  ticks: z.array(timelineTickSchema).optional().describe("Axis labels. Without them the axis is unlabelled."),
  playhead: unitSchema
    .default(1)
    .describe("How much of the window has played, left to right. An event appears when the playhead reaches it. Drive with ease()."),
  legend: z
    .object({
      neutral: z.string().optional().describe("Name for neutral events: `wasted`, `no change`."),
      added: z.string().optional().describe("Name for added events: `useful`."),
      danger: z.string().optional().describe("Name for danger events: `failed`."),
    })
    .optional()
    .describe('What each tone is called in the count line: `{ neutral: "wasted", added: "useful" }`. A tone without a name is only in the total.'),
  title: z.string().optional().describe("Which record or job this is: `order 1042`, `sync_stock`."),
  side: z.enum(["left", "right"]).default("right").describe("Pair with the CameraRig shot's `shift` to move the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type EventTimelineProps = z.input<typeof eventTimelineSchema>;

const TRACK = 860;
const LANE = 34;
const LANES = 3;
const STEM = 36;
/** Geist Mono at 21px is about 12.6px a character. */
const CHAR = 12.6;
const DOT = 20;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Irregular events on a strip of time, with a playhead. For what happened to
 * one record over a day: which runs were wasted, which mattered, which failed.
 * Goes in World's `overlay`.
 */
export const EventTimeline = (props: EventTimelineProps) => {
  const { events, window: range, ticks, playhead, legend, title, side, appear } = eventTimelineSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const [start, end] = range;
  const span = end - start || 1;
  const x = (at: number) => clamp((at - start) / span) * TRACK;
  const played = start + playhead * span;
  const colorOf = (tone: z.infer<typeof toneSchema>) => (tone === "neutral" ? theme.textDim : theme[tone]);
  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const dim = { fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim };

  // Labels go in the lowest lane where they clear the label before them, so their layout never depends on the playhead.
  const sorted = events.map((event, index) => ({ ...event, index })).sort((a, b) => a.at - b.at);
  const laneEnds = Array.from({ length: LANES }, () => -Infinity);
  const placed = sorted.map((event) => {
    if (!event.label) {
      return { ...event, lane: -1, left: 0 };
    }
    const width = event.label.length * CHAR;
    const left = Math.min(TRACK - width, Math.max(0, x(event.at) - width / 2));
    const free = laneEnds.findIndex((laneEnd) => left > laneEnd + 14);
    const lane = free === -1 ? LANES - 1 : free;
    laneEnds[lane] = left + width;
    return { ...event, lane, left };
  });
  const lanesUsed = Math.max(0, ...placed.map((event) => event.lane + 1));
  const height = STEM + lanesUsed * LANE + 6;

  const shown = placed.filter((event) => event.at <= played);
  const counts = (["added", "danger", "neutral"] as const)
    .filter((tone) => legend?.[tone])
    .map((tone) => ({ tone, name: legend?.[tone], count: shown.filter((event) => event.tone === tone).length }));

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        padding: "24px 34px 20px",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      {title ? <div style={{ fontSize: 27, color: theme.text, marginBottom: 12 }}>{title}</div> : null}
      <div style={{ display: "flex", gap: 34, fontSize: 25, marginBottom: 18, color: theme.text }}>
        <span>
          {shown.length} {shown.length === 1 ? "event" : "events"}
        </span>
        {counts.map((count) => (
          <span key={count.tone} style={{ display: "flex", alignItems: "center", gap: 10, color: colorOf(count.tone) }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: colorOf(count.tone) }} />
            {count.count} {count.name}
          </span>
        ))}
      </div>
      <div style={{ position: "relative", width: TRACK, height, borderBottom: `2px solid ${theme.panelBorder}` }}>
        {/* Drawn first, so markers and labels sit on top of it. */}
        <div style={{ position: "absolute", left: playhead * TRACK - 1.5, top: -8, bottom: -14, width: 3, borderRadius: 2, background: theme.accent }} />
        {placed.map((event) => {
          // Fades in over the first 1.5% of the window after the playhead reaches it.
          const shownIn = clamp(0.3 + (played - event.at) / (span * 0.015));
          if (event.at > played) {
            return null;
          }
          const color = colorOf(event.tone);
          const left = x(event.at);
          return (
            <div key={event.index} style={{ opacity: shownIn }}>
              <span style={{ position: "absolute", left: left - 1.5, bottom: 0, width: 3, height: STEM, background: color }} />
              <span
                style={{
                  position: "absolute",
                  left: left - DOT / 2,
                  bottom: STEM - DOT / 2,
                  width: DOT,
                  height: DOT,
                  borderRadius: DOT / 2,
                  boxSizing: "border-box",
                  background: event.tone === "neutral" ? theme.panel : color,
                  border: `3px solid ${color}`,
                }}
              />
              {event.label ? (
                <span
                  style={{
                    position: "absolute",
                    left: event.left,
                    bottom: STEM + 10 + event.lane * LANE,
                    whiteSpace: "nowrap",
                    padding: "0 4px",
                    marginLeft: -4,
                    background: theme.panel,
                    fontSize: 21,
                    color: event.tone === "neutral" ? theme.text : color,
                  }}
                >
                  {event.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", width: TRACK, height: 40, ...dim, fontFamily: theme.mono, fontWeight: 500, fontSize: 20 }}>
        {(ticks ?? []).map((tick) => {
          const left = x(tick.at);
          const anchor = left < 30 ? "0%" : left > TRACK - 30 ? "-100%" : "-50%";
          return (
            <div key={`${tick.at} ${tick.label}`}>
              <span style={{ position: "absolute", left: left - 1, top: 0, width: 2, height: 8, background: theme.panelBorder }} />
              <span style={{ position: "absolute", left, top: 12, transform: `translateX(${anchor})`, whiteSpace: "nowrap" }}>{tick.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
