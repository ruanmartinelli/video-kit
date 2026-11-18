# Bars

A few values as bars drawn to scale from a shared zero: before and after, cold and warm. Two to six bars. More than that is a chart, and a chart is a still image.

## Bars

- `bars` ({ label: string; value: number; tone: "neutral" | "accent" | "danger" | "added" | "changed" | "removed" })[], required. The values to compare, left to right. Two to six.
- `unit` string. Read after each value: `lines`, `ms`, `queries`.
- `title` string. What is measured, above the bars: `lines in checkout()`.
- `progress` number 0–1 = 1. How far the bars have grown from zero. Drive with ease().
- `side` "left" | "right" = "right". Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Bar

- `label` string, required. What the bar is, under it: `before`, `after`, `p99`.
- `value` number, required. Its size. Every bar is drawn to scale against the largest.
- `tone` "neutral" | "accent" | "danger" | "added" | "changed" | "removed" = "neutral". neutral for the baseline; added/changed/removed for what a change did; accent or danger to point at one.

## Example

```tsx
<Bars
  title="lines in reserveStock()"
  unit="lines"
  bars={[{ label: "before", value: 40 }, { label: "after", value: 3, tone: "changed" }]}
  progress={ease(frame, t.at("shorter"), t.at("shorter") + 50)}
  side="left"
/>
```
