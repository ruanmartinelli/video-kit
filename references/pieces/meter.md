# Meter

A value moving against a limit: stock crossing its minimum, a transaction filling toward its time cap, a queue backing up. Drive `value` from the frame. The bar and the number turn red on the wrong side of `limit`.

## Meter

- `label` string, required. What is measured, as the code calls it: `available`, `elapsed`.
- `value` number, required. The current reading. Drive it with ease() between two readings; the bar and the number follow.
- `max` number, required. The right end of the track. Pick it so the limit sits well inside the track, not at an end.
- `min` number = 0. The left end of the track.
- `limit` number. The line the value must not cross, drawn as a tick across the track.
- `limitLabel` string. What the limit is called: `minimum`, `time limit`. Shown above the tick with its value.
- `breach` "below" | "above" = "below". Which side of the limit is the bad one: below for stock under a minimum, above for a time cap. The bar and the number turn red there.
- `unit` string. Written after every number: `s`, `units`.
- `decimals` number = 0. Decimal places shown. The value is rounded, so an eased value reads as whole numbers by default.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
<Meter label="available" value={12 - 9 * ease(frame, t.at("sold"), t.at("sold") + 40)} max={20} limit={5} limitLabel="minimum" unit="units" />

<Meter label="transaction open" value={9 * ease(frame, start, start + 90)} max={10} limit={8} limitLabel="time limit" breach="above" unit="s" decimals={1} />
```
