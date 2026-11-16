# Chapter

For a video longer than a few minutes: a title card when a chapter starts, and a thin rail along the bottom that shows how far in the viewer is. The rail stays on screen; pass `appear={0}` between cards.

## Chapter

- `titles` string[], required. One title per chapter, in order. Two to twelve.
- `current` number, required. Index of the chapter on screen, from 0. Chapters before it show as done on the rail.
- `appear` number 0–1 = 1. The title card, centered over the scene: 0 = hidden, 1 = fully in. Bring it up for a few seconds at the start of each chapter.
- `rail` boolean = true. A thin segmented rail along the bottom edge, one segment per chapter. It stays on whatever `appear` is.

## Example

```tsx
const starts = [t.at("orders"), t.at("stock"), t.at("cost")];
const current = starts.findLastIndex((start) => start <= frame);

<Chapter
  titles={["Where orders come from", "Reserving stock", "What it costs"]}
  current={current}
  appear={ease(frame, starts[current], starts[current] + 10) * (1 - ease(frame, starts[current] + 50, starts[current] + 62))}
/>
```
