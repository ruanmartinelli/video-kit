import { useCurrentFrame } from "remotion";
import { CameraRig, Node, NODE_HEIGHT, World } from "../kit";

export const panelGalleryMeta = { id: "PanelGallery", fps: 30, width: 1920, height: 1080, durationInFrames: 300 };

/** Scratch stage for looking at kit pieces while they are built. `pnpm stills PanelGallery`. */
export const PanelGallery = () => {
  const frame = useCurrentFrame();
  return (
    <World overlay={null}>
      <CameraRig shots={[{ at: 0, targets: [[0, NODE_HEIGHT / 2, 0]] }]} />
      <Node position={[0, NODE_HEIGHT / 2, 0]} label={"frame " + frame} />
    </World>
  );
};
