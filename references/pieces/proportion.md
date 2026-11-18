# Proportion

A share as a grid of dots: 33 of 100, 7 of 128. For the moment a number is the point and the viewer should feel its size. The filled dots come in one by one with `progress`.

## Proportion

- `part` number, required. How many have it: the 33 in `33 of 100`.
- `total` number, required. How many there are in all: the 100 in `33 of 100`.
- `label` string. What the part is, read after the numbers: `have a transcript`.
- `cells` number = 100. Dots in the grid, drawn 10 per row: 100 is one dot per percent, 10 a single row. The filled share is rounded to whole dots, and is at least one when `part` is above zero.
- `tone` "accent" | "danger" | "added" = "accent". Color of the filled dots and the number.
- `progress` number 0–1 = 1. How many of the filled dots are in, one by one. Drive with ease().
- `side` "left" | "right" = "right". Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
<Proportion part={33} total={100} label="orders have a tracking number" progress={ease(frame, t.at("share"), t.at("share") + 40)} />
```
