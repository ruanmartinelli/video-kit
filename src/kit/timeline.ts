export type Word = { text: string; startMs: number; endMs: number };

/** One spoken beat, as written by `pnpm narrate`. Word times are relative to the beat's audio. */
export type NarrationBeat = {
  id: string;
  text: string;
  audio: string;
  durationMs: number;
  words: Word[];
};

export type Narration = { voice: string; beats: NarrationBeat[] };

export type TimelineBeat = NarrationBeat & {
  /** Frame the beat's audio starts. */
  from: number;
  /** Frame the beat's audio ends. */
  to: number;
};

export type Timeline = {
  fps: number;
  durationInFrames: number;
  beats: TimelineBeat[];
  /**
   * Frame a beat starts, or the frame `word` is spoken inside it.
   * `occurrence` picks among repeats of the word within the beat (0 = first).
   */
  at: (beatId: string, word?: string, occurrence?: number) => number;
  /** Frame a beat's audio ends. */
  end: (beatId: string) => number;
};

type TimelineOptions = {
  fps?: number;
  /** Silence before the first beat. */
  leadMs?: number;
  /** Silence between beats. */
  gapMs?: number;
  /** Silence after the last beat. */
  tailMs?: number;
};

const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const createTimeline = (narration: Narration, { fps = 30, leadMs = 500, gapMs = 350, tailMs = 1200 }: TimelineOptions = {}): Timeline => {
  const toFrames = (ms: number) => Math.round((ms / 1000) * fps);

  let cursorMs = leadMs;
  const beats = narration.beats.map((beat) => {
    const from = toFrames(cursorMs);
    cursorMs += beat.durationMs;
    const to = toFrames(cursorMs);
    cursorMs += gapMs;
    return { ...beat, from, to };
  });

  const find = (beatId: string) => {
    const beat = beats.find((b) => b.id === beatId);
    if (!beat) {
      throw new Error(`No beat "${beatId}". Beats: ${beats.map((b) => b.id).join(", ")}`);
    }
    return beat;
  };

  return {
    fps,
    durationInFrames: toFrames(cursorMs - gapMs + tailMs),
    beats,
    at: (beatId, word, occurrence = 0) => {
      const beat = find(beatId);
      if (word === undefined) {
        return beat.from;
      }
      const match = beat.words.filter((w) => normalize(w.text) === normalize(word))[occurrence];
      if (!match) {
        throw new Error(`Beat "${beatId}" has no occurrence ${occurrence} of "${word}": "${beat.text}"`);
      }
      return beat.from + toFrames(match.startMs);
    },
    end: (beatId) => find(beatId).to,
  };
};

/**
 * The frames worth looking at: for each beat, just after it starts, its middle
 * and just before it ends, plus the last frame. `pnpm stills <Id> cues` renders these.
 */
export const cueFrames = (timeline: Timeline) => {
  const last = timeline.durationInFrames - 1;
  const frames = timeline.beats.flatMap((beat) => [beat.from + 10, Math.round((beat.from + beat.to) / 2), beat.to - 2]);
  return [...new Set([...frames, last].map((frame) => Math.min(last, Math.max(0, frame))))].sort((a, b) => a - b);
};
