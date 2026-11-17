import { Composition, registerRoot } from "remotion";
import { ActorGallery, actorGalleryMeta } from "./gallery/ActorGallery";
import { CompareGallery, compareGalleryMeta } from "./gallery/CompareGallery";
import { OverlayGallery, overlayGalleryMeta } from "./gallery/OverlayGallery";
import { PanelGallery, panelGalleryMeta } from "./gallery/PanelGallery";
import { ShapeGallery, shapeGalleryMeta } from "./gallery/ShapeGallery";
import { ShapeGallery2D, shapeGallery2DMeta } from "./gallery/ShapeGallery2D";
import { makeRoot } from "./Root";

// The kit on its own: the galleries, for looking at a piece. A video brings its own entry, written by the scripts.
registerRoot(
  makeRoot(
    [],
    <>
      <Composition component={ShapeGallery} {...shapeGalleryMeta} />
      <Composition component={ShapeGallery2D} {...shapeGallery2DMeta} />
      <Composition component={ActorGallery} {...actorGalleryMeta} />
      <Composition component={CompareGallery} {...compareGalleryMeta} />
      <Composition component={PanelGallery} {...panelGalleryMeta} />
      <Composition component={OverlayGallery} {...overlayGalleryMeta} />
    </>,
  ),
);
