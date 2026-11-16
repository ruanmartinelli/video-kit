export type Word = { text: string; startMs: number; endMs: number };

export type Narration = {
  voice: string;
  text: string;
  durationMs: number;
  words: Word[];
};

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const narrationFrames = (narration: Narration, fps: number) =>
  Math.ceil((narration.durationMs / 1000) * fps);

const normalize = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Frame at which `word` starts being spoken. `occurrence` picks among repeats (0 = first). */
export const cueFrame = (narration: Narration, word: string, fps: number, occurrence = 0) => {
  const matches = narration.words.filter((w) => normalize(w.text) === normalize(word));
  const match = matches[occurrence];
  if (!match) {
    throw new Error(`Narration has no occurrence ${occurrence} of "${word}"`);
  }
  return msToFrame(match.startMs, fps);
};
