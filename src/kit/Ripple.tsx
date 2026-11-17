import { z } from "zod";
import { radii, radiusSchema } from "./graph";
import { unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";
import { rippleSchema } from "./schemas";

export { rippleSchema };

type RippleProps = z.input<typeof rippleSchema>;

/** Gap between a ring and the one behind it, in world units. */
const GAP = 1.2;
const FADE = 0.2;

/** Rings spreading across the floor from one point: a change reaching everything that depends on it. */
export const Ripple = (props: RippleProps) => {
  const { at, radius, progress, tone, rings } = rippleSchema.parse(props);

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const [across, deep] = radii(radius);
  const fade = Math.min(1, (1 - progress) / FADE);

  return (
    <group position={[at[0], 0.03, at[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: rings }, (_, ring) => {
        const reach = progress - (ring * GAP) / Math.max(across, deep);
        if (reach <= 0) {
          return null;
        }
        return (
          <mesh key={ring} scale={[across * reach, deep * reach, 1]}>
            <ringGeometry args={[0.985, 1, 128]} />
            <meshBasicMaterial color={theme[tone]} toneMapped={false} transparent depthWrite={false} opacity={0.85 * fade * (1 - ring / rings)} />
          </mesh>
        );
      })}
    </group>
  );
};
