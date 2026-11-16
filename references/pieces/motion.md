# Motion helpers

Every value that moves is one of these, called with the current frame and a cue. Nothing in a video keeps time on its own.

## Also

- `between(frame, from, to)` 0 to 1. 1 between two cues, 0 outside them, eased in and out. For a panel's or chip's `appear`.
- `hop(frame, start, frames = 14)` 0 to 1. A packet's `progress` for a trip that leaves at `start`. A second hop continues at `start + 14`.
- `pulse(frame, at, decay = 20)` 0 to 1. Rises to 1 at `at`, then fades. For a node's `active` on the frame something reaches it, or a row's `lit`.
- `ease(frame, from, to)` 0 to 1. 0 before `from`, 1 after `to`, eased between. For anything that goes once and stays: a value, a `flip`, a `progress`.
- `pop(frame, at)` 0 to ~1. Springs to 1 with a little overshoot. For a node's `appear` when it enters the scene.

## Example

```tsx
const frame = useCurrentFrame();
const codeIn = between(frame, cue.code, cue.next);

<CodePanel code={CODE} appear={codeIn} />
<Graph3D graph={graph} nodes={{ api: { active: pulse(frame, cue.request + 14) }, cache: { appear: pop(frame, cue.cache) } }} />
<Packet from={at("app")} to={at("api")} progress={hop(frame, cue.request)} />
<Packet from={at("api")} to={at("db")} progress={hop(frame, cue.request + 14)} />
```
