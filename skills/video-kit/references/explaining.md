# Explaining a bug, a plan or a system

`src/videos/bug-low-stock/` is the reference bug video and `src/videos/load-balancer/` the reference for how a system works. Copy the one that matches.

**How it opens.** On the problem: what the user saw, or what breaks without the thing being explained.

**How it ends.** On what the solution costs.

## Picking the piece

Pick the piece by what the beat is about.

- **A rule that lets some things through** (a trigger condition, a filter, a guard): a `Gate` on the pipe, with the rule as its text. Send each case to `gatePoint()`, then on through in `accent` or back in `danger`, and pulse the gate in the same tone.
- **A record changing state**: `Lifecycle` for the state it is in, `RecordCard` for the field that changed (flip it on the frame the write lands), a `badge` on the node that holds it (`locked`, `syncing`, `failed`, `done`).
- **A number against a limit** (stock and its minimum, a transaction and its time cap): `Meter`, with `value` driven from the frame.
- **What happened to one thing over a day**: `EventTimeline`. `Schedule` when the events are a fixed interval.
- **One becomes many, or many become one** (fan-out, batching, dedupe): `Fan`.
- **Old and new at the same time**: `layoutLanes(graph)` gives one copy of the graph per lane. Send the same packet down both on the same frame. Use lanes when the paths differ; when only the answer differs, run it twice with `Outcomes`.
- **A rollout**: `Phases`, with `current` moving on as each step is spoken.
- **A size or a share**: `Bars` for two to six values to scale, `Proportion` for a part of a whole.
- **Someone asking an assistant**: `Chat`. The assistant is an `agent` node and the model it calls is a `model` node.
- **A word the viewer may not know**: `Term`, on screen while the thing it names is.
- **The one thing in the shot to look at**: `Callout`. One per shot.
- **A line of code that changed**: `CodePanel` with `removed` and `added`, the old line above the new one.
- **The app's own screen**: `Screenshot`, with `highlight` on what the narration names and `wipe` from the old screen to the new.
- **A video over three minutes**: `Chapter`, with a title card at each chapter start.

## A bug and its fix

Open on what the user saw. Follow the one record that went wrong to the line that explains it. Replay the same record with the fix, then show a case that must still work. End on what the fix costs.

## A storyboard, for presenting it yourself

A storyboard is a few frames of a finished video on one sheet. Write `src/videos/<name>/board.ts` (copy `src/videos/load-balancer/board.ts`): the video's composition id, and a frame and a note for each of three or four panels. Add it to the folder's `video.ts` as `board`. `pnpm storyboard <Id>Board` writes `out/storyboard/<Id>Board.png` and `<Id>Board-notes.png`.
