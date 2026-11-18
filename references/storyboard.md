# A storyboard

A storyboard is a few frames of a finished video on one sheet, for someone who presents it themselves. Add a `board` to the video's `video.ts`: three or four panels, each a frame (a cue) and a note for what to say over it.

```ts
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

`pnpm storyboard <folder>` writes `<folder>/out/storyboard.png` and `storyboard-notes.png`: the same sheet, clean and with the notes.
