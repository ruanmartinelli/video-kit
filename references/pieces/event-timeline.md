# EventTimeline

What happened to one thing over a stretch of time: irregular events on an axis, with a playhead. Each event is plain, useful or failed, and a count line keeps score as the playhead passes them. Schedule is for a fixed interval; this is for a real day.

## EventTimeline

- `events` ({ at: number; label: string; tone: "neutral" | "added" | "danger" })[], required. Everything that happened to one record, in any order.
- `window` [number, number], required. The stretch of time the axis covers, `[start, end]`, in the unit of `at`.
- `ticks` ({ at: number; label: string })[]. Axis labels. Without them the axis is unlabelled.
- `playhead` number 0–1 = 1. How much of the window has played, left to right. An event appears when the playhead reaches it. Drive with ease().
- `legend` { neutral: string; added: string; danger: string }. What each tone is called in the count line: `{ neutral: "wasted", added: "useful" }`. A tone without a name is only in the total.
- `title` string. Which record or job this is: `order 1042`, `sync_stock`.
- `side` "left" | "right" = "right". Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Event

- `at` number, required. When it happened, in the same unit as `window`: minutes since midnight, seconds since start.
- `label` string. A word or two over the marker: `retry`, `paid`. Leave it off on most events; labels that would overlap stack upward.
- `tone` "neutral" | "added" | "danger" = "neutral". neutral for an event that did nothing useful, added for one that mattered, danger for one that failed.

## Tick

- `at` number, required. Where on the axis, in the same unit as `window`.
- `label` string, required. What the axis says there: `09:00`, `13:00`.

## Example

```tsx
<EventTimeline
  title="sync_stock, order 1042"
  window={[8 * 60, 18 * 60]}
  ticks={[{ at: 9 * 60, label: "09:00" }, { at: 13 * 60, label: "13:00" }, { at: 17 * 60, label: "17:00" }]}
  events={[...hourly.map((hour) => ({ at: hour * 60 })), { at: 790, label: "stock changed", tone: "added" }]}
  playhead={ease(frame, t.at("day"), t.at("day") + 150)}
  legend={{ neutral: "wasted", added: "useful", danger: "failed" }}
/>
```
