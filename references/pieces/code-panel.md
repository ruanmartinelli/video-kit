# CodePanel

Highlighted code on a flat card, because code at an angle is unreadable. Spotlight lines as they are spoken, or mark the lines a change removed and added. Shift the camera so the 3D subject sits on the other side.

## CodePanel

- `code` string, required. Keep it under ~10 short lines; it has to be read in seconds.
- `lang` "typescript" | "python" | "bash" | "json" | "sql" = "typescript"
- `title` string
- `highlight` number[] = []. 1-based lines to spotlight. The rest dim.
- `removed` number[] = []. 1-based lines a change took out: red, struck through, marked `-`. Show the old and new line one above the other.
- `added` number[] = []. 1-based lines a change put in: green, marked `+`.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject to the other side.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
<World overlay={<CodePanel code={code} highlight={[5, 6]} appear={ease(frame, 5, 20)} />}>
  <CameraRig shots={[{ at: 0, targets: [lb], view: "close", shift: [-0.2, 0.04] }]} />
</World>
```
