import { Composition, registerRoot } from "remotion";
import { ActorGallery, actorGalleryMeta } from "./gallery/ActorGallery";
import { ActorGallery2D, actorGallery2DMeta } from "./gallery/ActorGallery2D";
import { CompareGallery, compareGalleryMeta } from "./gallery/CompareGallery";
import { CompareGallery2D, compareGallery2DMeta } from "./gallery/CompareGallery2D";
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
      <Composition component={ActorGallery2D} {...actorGallery2DMeta} />
      <Composition component={CompareGallery} {...compareGalleryMeta} />
      <Composition component={CompareGallery2D} {...compareGallery2DMeta} />
      <Composition component={PanelGallery} {...panelGalleryMeta} />
      <Composition component={OverlayGallery} {...overlayGalleryMeta} />
    </>,
  ),
);
