# Storyboard

A few frames of a finished video on one sheet, for presenting it yourself. The board is data: the video's composition id and a frame and a note per panel. Register `Storyboard` as a composition with the board as its props, then `pnpm storyboard <Id>` writes `out/storyboard/<Id>.png` and `<Id>-notes.png`: the same sheet, clean and with what to say under each panel.

## Storyboard

- `video` string, required. Id of the composition the panels are taken from.
- `panels` ({ frame: number; note: string })[], required. The moments worth talking over, in order. Three or four is a storyboard; six is the limit.
- `size` [number, number] = [1920,1080]. Width and height of that video.
- `images` string[] = []. One rendered frame per panel. `pnpm storyboard` fills this in; leave it out.

## Panel

- `frame` number, required. The frame of the video this panel shows. Use a cue: `t.at(beat, word)`.
- `note` string, required. What to say over this panel. One or two sentences.

## Example

```tsx
// src/videos/load-balancer/board.ts
export const loadBalancerBoard: StoryboardProps = {
  video: loadBalancerMeta.id,
  panels: [
    { frame: t.at("problem", "falls") + 10, note: "One server takes every request. Past its limit, it falls over." },
    { frame: t.at("route", "picks") + 12, note: "With a balancer in front, every request stops there first." },
  ],
};
export const loadBalancerBoardMeta = storyboardMeta("LoadBalancerBoard", loadBalancerBoard);

// src/Root.tsx
<Composition component={Storyboard} {...loadBalancerBoardMeta} defaultProps={loadBalancerBoard} />
```
