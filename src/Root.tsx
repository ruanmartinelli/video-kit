import { Composition } from "remotion";
import { ActorGallery, actorGalleryMeta } from "./gallery/ActorGallery";
import { CompareGallery, compareGalleryMeta } from "./gallery/CompareGallery";
import { OverlayGallery, overlayGalleryMeta } from "./gallery/OverlayGallery";
import { PanelGallery, panelGalleryMeta } from "./gallery/PanelGallery";
import { ShapeGallery, shapeGalleryMeta } from "./gallery/ShapeGallery";
import { cueFrames, Storyboard, storyboardMeta, type Video } from "./kit";
import { Sheet, sheetMeta } from "./tools/Sheet";

/** Carries each video's cue frames to `pnpm stills`, which cannot import a timeline itself. */
const Cues = (_: { cues: Record<string, number[]> }) => null;

/**
 * Everything a bundle can render: the videos it was given, their storyboards,
 * and the kit's own galleries and tools. The scripts write an entry file that
 * calls this with one video; the kit's own entry calls it with none.
 */
export const makeRoot = (videos: Video[]) => () => (
  <>
    {videos.map(({ component, meta }) => (
      <Composition key={meta.id} component={component} {...meta} />
    ))}
    {videos.map(({ meta, board }) =>
      board ? (
        <Composition
          key={meta.id}
          component={Storyboard}
          {...storyboardMeta(`${meta.id}Board`, { ...board, video: meta.id })}
          defaultProps={{ ...board, video: meta.id }}
        />
      ) : null,
    )}
    <Composition component={ShapeGallery} {...shapeGalleryMeta} />
    <Composition component={ActorGallery} {...actorGalleryMeta} />
    <Composition component={CompareGallery} {...compareGalleryMeta} />
    <Composition component={PanelGallery} {...panelGalleryMeta} />
    <Composition component={OverlayGallery} {...overlayGalleryMeta} />
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
