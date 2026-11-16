# Storyboard

A few frames of a finished video on one sheet, for presenting it yourself. The board is data in the video's `video.ts`: a frame and a note per panel. `pnpm storyboard <folder>` writes `out/storyboard.png` and `out/storyboard-notes.png`: the same sheet, clean and with what to say under each panel.

## Storyboard

- `video` string, required. Id of the composition the panels are taken from. The kit fills this in.
- `panels` ({ frame: number; note: string })[], required. The moments worth talking over, in order. Three or four is a storyboard; six is the limit.
- `size` [number, number] = [1920,1080]. Width and height of that video.
- `images` string[] = []. One rendered frame per panel. `pnpm storyboard` fills this in; leave it out.

## Panel

- `frame` number, required. The frame of the video this panel shows. Use a cue: `t.at(beat, word)`.
- `note` string, required. What to say over this panel. One or two sentences.

## Example

```tsx
// video.ts
export const video: Video = {
  component: LowStock,
  meta: lowStockMeta,
  timeline,
  board: {
    panels: [
      { frame: timeline.at("writes", "reserves") - 6, note: "One order makes the save write the row twice." },
      { frame: timeline.at("fix", "ended"), note: "The fix checks the save once." },
    ],
  },
};
```
