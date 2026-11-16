import { useCurrentFrame } from "remotion";
import { CameraRig, Node, NODE_HEIGHT, nodeShapeSchema, pop, pulse, World, type Vec3 } from "../kit";

const SHAPES = nodeShapeSchema.options;
const COLUMNS = 4;
const position = (index: number): Vec3 => [
  ((index % COLUMNS) - (COLUMNS - 1) / 2) * 3.6,
  NODE_HEIGHT / 2,
  (Math.floor(index / COLUMNS) - 0.5) * 6.5,
];

export const shapeGalleryMeta = { id: "ShapeGallery", fps: 30, width: 1920, height: 1080, durationInFrames: 210 };

/** Every node shape side by side. `pnpm stills ShapeGallery` is how you look at a shape you changed. */
export const ShapeGallery = ({ tone = "accent" }: { tone?: "accent" | "danger" }) => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: SHAPES.map((_, index) => position(index)), azimuth: 14 }]} />
      {SHAPES.map((shape, index) => (
        <Node
          key={shape}
          position={position(index)}
          label={shape}
          shape={shape}
          tone={tone}
          appear={pop(frame, 5 + index * 5)}
          active={pulse(frame, 70 + index * 14, 24)}
        />
      ))}
    </World>
  );
};
