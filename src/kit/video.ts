import type { ComponentType } from "react";
import type { StoryboardProps } from "./Storyboard";
import type { Timeline } from "./timeline";

/** One video, as its folder's `video.ts` exports it. */
export type Video = {
  component: ComponentType;
  meta: { id: string; fps: number; width: number; height: number; durationInFrames: number };
  /** Where the cue frames come from. */
  timeline: Timeline;
  /** A storyboard, registered as `<id>Board`. */
  board?: StoryboardProps;
};
