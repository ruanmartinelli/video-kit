# Pieces

Written by `pnpm kit:api` from `docs/registry.tsx`. Edit the registry, not this file.

Each piece has its props and an example in `pieces/<id>.md`. Read the ones you are about to use.

## Stage

- `world` **World**: The one 3D space a video happens in: floor, lights, fog.
- `camera-rig` **CameraRig**: The camera is the narrator.
- `timeline` **Timeline**: Turns narration into frame numbers.
- `storyboard` **Storyboard**: A few frames of a finished video on one sheet, for presenting it yourself.

## Actors

- `node` **Node**: A service, process or machine.
- `shapes` **Node shapes**: What a Node looks like.
- `change` **Change marks**: For reviewing a PR.
- `packet` **Packet + Pipe**: The packet is the thing the viewer follows: a request, a message, a row.
- `gate` **Gate**: A condition drawn on the connection itself: a ring the pipe runs through, with its rule above it.
- `fan` **Fan**: One thing becomes many, or many collapse into one: a request fanned out to shards, a batch split into jobs, duplicates merged into one record.
- `callout` **Callout**: A note tied to a point in the world by a leader line, for the one thing in the shot the narration is about.
- `hub` **layoutHub + Ripple**: For something many things depend on: a shared helper, a table, a core service.
- `graph` **Graph3D**: Lays out nodes and pipes so nobody places coordinates by hand.
- `lanes` **layoutLanes**: The same graph once per lane, one behind the other, so two versions of a system run side by side in one shot: before and after, v1 beside v2.
- `focus` **Focus**: Dims every actor inside it except the ones you name.
- `label` **Label**: Short text in the world that always faces the camera.

## Overlay

- `tables` **Tables**: Database tables as flat panels over the scene: a name, then one row per column.
- `outcomes` **Outcomes**: For a PR that changes existing behaviour, like an auth check or a shared helper.
- `schedule` **Schedule**: When a job runs, as ticks on a strip of time.
- `lifecycle` **Lifecycle**: The states a record moves through, in a row, with the current one lit and a marker that travels between them.
- `meter` **Meter**: A value moving against a limit: stock crossing its minimum, a transaction filling toward its time cap, a queue backing up.
- `event-timeline` **EventTimeline**: What happened to one thing over a stretch of time: irregular events on an axis, with a playhead.
- `record-card` **RecordCard**: One record as a card whose field flips from its old value to its new one.
- `phases` **Phases**: A rollout as a strip of steps: the ones done are checked, the current one is lit.
- `proportion` **Proportion**: A share as a grid of dots: 33 of 100, 7 of 128.
- `bars` **Bars**: A few values as bars drawn to scale from a shared zero: before and after, cold and warm.
- `chat` **Chat**: Message bubbles that type, for anything where someone asks an assistant: a support bot, a coding agent, a prompt and its answer.
- `term` **Term**: A word and its one-line meaning, pinned in a corner while the thing it names is on screen.
- `chapter` **Chapter**: For a video longer than a few minutes: a title card when a chapter starts, and a thin rail along the bottom that shows how far in the viewer is.
- `screenshot` **Screenshot**: An app screen in a browser frame, for the part of a story that happens in the UI.
- `manifest` **Manifest**: The opening card of a PR review that covers more than one thing: every item, in the order the video covers them, and a line for what it leaves out.
- `code-panel` **CodePanel**: Highlighted code on a flat card, because code at an angle is unreadable.
- `caption` **Caption + Narration**: Caption shows the words of the current beat and lights each one as it is spoken.
