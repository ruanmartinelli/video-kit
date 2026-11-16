import { Audio, Sequence, staticFile } from "remotion";
import type { Timeline } from "./timeline";

/** Plays every beat's audio at its place on the timeline. Goes in World's `overlay`. */
export const Narration = ({ timeline }: { timeline: Timeline }) => (
  <>
    {timeline.beats.map((beat) => (
      <Sequence key={beat.id} from={beat.from} layout="none">
        <Audio src={staticFile(beat.audio)} />
      </Sequence>
    ))}
  </>
);
