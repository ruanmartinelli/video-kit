# Screenshot

An app screen in a browser frame, for the part of a story that happens in the UI. Outline what the narration is about with `highlight`, and sweep from the old screen to the new one with `wipe`. Images live under `public/`.

## Screenshot

- `src` string, required. The screen: a path under public/ (`demo/app-before.svg`, no leading slash) or an absolute http(s) URL.
- `after` string. The same screen after the change, same kind of path. `wipe` moves between the two.
- `wipe` number 0–1 = 0. 0 shows all of `src`, 1 all of `after`; in between, a line sweeps left to right with `after` behind it. Drive with ease().
- `highlight` { x: number 0–1; y: number 0–1; width: number 0–1; height: number 0–1; appear: number 0–1 }. An outlined box around the part of the screen the narration is about.
- `url` string. Text for the address bar: `app.example.com/orders`.
- `width` number 400–1600 = 1100. Width of the frame in px. The height follows the image: a 16:10 screen at 1100 ends just above the captions, so go wider only for a short, wide screen.
- `side` "left" | "right" | "center" = "center". center for a screen that wants the frame; left or right to keep a 3D subject beside it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Highlight

- `x` number 0–1, required. Left edge of the box, as a share of the image width.
- `y` number 0–1, required. Top edge of the box, as a share of the image height.
- `width` number 0–1, required. Width of the box, as a share of the image width.
- `height` number 0–1, required. Height of the box, as a share of the image height.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
<Screenshot
  src="demo/app-before.svg"
  after="demo/app-after.svg"
  url="admin.example.com/orders"
  wipe={ease(frame, t.at("after"), t.at("after") + 45)}
  highlight={{ x: 0.815, y: 0.285, width: 0.165, height: 0.086, appear: ease(frame, t.at("export"), t.at("export") + 14) }}
  appear={ease(frame, 4, 16)}
/>
```
