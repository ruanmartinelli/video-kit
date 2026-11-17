import type { z } from "zod";
import { radii } from "../kit/graph";
import { rippleSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { DEPTH } from "./camera";
import { useCamera } from "./World";

type RippleProps = z.input<typeof rippleSchema>;

/** Gap between a ring and the one behind it, in world units. */
const GAP = 1.2;
const FADE = 0.2;

/** Rings spreading from one point: a change reaching everything that depends on it. */
export const Ripple = (props: RippleProps) => {
  const { at, radius, progress, tone, rings } = rippleSchema.parse(props);
  const camera = useCamera();

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const [across, deep] = radii(radius);
  const [x, y] = camera.point(at);
  const fade = Math.min(1, (1 - progress) / FADE);

  return (
    <>
      {Array.from({ length: rings }, (_, ring) => {
        const reach = progress - (ring * GAP) / Math.max(across, deep);
        if (reach <= 0) {
          return null;
        }
        return (
          <ellipse
            key={ring}
            cx={x}
            cy={y}
            rx={across * reach * camera.scale}
            ry={deep * DEPTH * reach * camera.scale}
            fill="none"
            stroke={theme[tone]}
            strokeWidth={3}
            opacity={0.85 * fade * (1 - ring / rings)}
          />
        );
      })}
    </>
  );
};
