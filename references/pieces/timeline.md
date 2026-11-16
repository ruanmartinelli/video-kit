# Timeline

Turns narration into frame numbers. Every animation is keyed to a beat or to a word spoken inside one, never to a hand-picked frame. `pnpm narrate <video>` writes narration.json from script.json.

## Also

- `t.at(beat)` number. Frame the beat starts.
- `t.at(beat, word, occurrence?)` number. Frame `word` is spoken inside the beat. Throws if it is not there.
- `t.end(beat)` number. Frame the beat's audio ends.
- `t.durationInFrames` number. Length of the whole video.

## Example

```tsx
import narration from "./narration.json";

const t = createTimeline(narration, { fps: 30 });

<Node active={pulse(frame, t.at("route", "picks"))} />
<Packet progress={ease(frame, t.at("route"), t.at("route") + 16)} />
```
