# Callout

A note tied to a point in the world by a leader line, for the one thing in the shot the narration is about. It faces the camera and draws over whatever is behind it. One at a time: two callouts in a shot is a diagram.

## Callout

- `id` string. Name used by Focus to keep this callout lit.
- `at` Vec3, required. The point it is about. A small dot marks it.
- `children` string, required. The note. A few words.
- `offset` [number, number] = [1.6,1.8]. Where the note sits from `at`, in world units on screen: [right, up]. A negative right puts it on the left.
- `tone` "neutral" | "accent" | "danger" = "neutral". neutral for a remark; accent or danger to tie it to what is lit.
- `appear` number 0–1 = 1. 0 = hidden. The line grows out of `at` over the first half, then the note comes in. Drive with ease().

## Example

```tsx
<Callout at={graph.position("cache")} offset={[2, 1.2]} tone="danger" appear={ease(frame, t.at("stale"), t.at("stale") + 30)}>
  reads stale stock
</Callout>
```
