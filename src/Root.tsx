import type { ReactNode } from "react";
import { Composition } from "remotion";
import { Storyboard, storyboardMeta } from "./kit/Storyboard";
import { cueFrames } from "./kit/timeline";
import type { Video } from "./kit/video";
import { Sheet, sheetMeta } from "./tools/Sheet";

/** Carries each video's cue frames to `pnpm stills`, which cannot import a timeline itself. */
const Cues = (_: { cues: Record<string, number[]> }) => null;

/**
 * Everything a bundle can render: the videos it was given, their storyboards
 * and the kit's tools. The scripts write an entry file that calls this with
 * one video. It imports no piece of the kit, so a flat video's bundle never
 * loads the 3D one. `extra` is for the kit's own galleries.
 */
export const makeRoot =
  (videos: Video[], extra: ReactNode = null) =>
  () => (
    <>
      {videos.map(({ component, meta }) => (
        <Composition key={meta.id} component={component} {...meta} />
      ))}
      {videos.map(({ meta, board }) =>
        board ? (
          <Composition key={meta.id} component={Storyboard} {...storyboardMeta(`${meta.id}Board`, { ...board, video: meta.id })} defaultProps={{ ...board, video: meta.id }} />
        ) : null,
      )}
      {extra}
      <Composition
        id="Cues"
        component={Cues}
        width={16}
        height={16}
        fps={30}
        durationInFrames={1}
        defaultProps={{ cues: Object.fromEntries(videos.map(({ meta, timeline }) => [meta.id, cueFrames(timeline)])) }}
      />
      <Composition component={Sheet} {...sheetMeta} defaultProps={{ images: [], labels: [] }} />
    </>
  );
