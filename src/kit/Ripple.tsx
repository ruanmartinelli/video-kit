import { z } from "zod";
import { radii, radiusSchema } from "./graph";
import { unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const rippleSchema = z.object({
  at: vec3Schema.describe("Where it starts: the center of the node that changed. Drawn on the floor under it."),
  radius: radiusSchema.default([10, 7.2]).describe("Where the front is at progress 1, and gone. Set it a little past what it should reach; give layoutHub's radius shape to match its spokes."),
  progress: unitSchema.describe("0 = nothing yet, 1 = the front is at `radius`. The front travels at a steady pace, so it reaches halfway at 0.5."),
  tone: z.enum(["accent", "danger", "added", "changed", "removed"]).default("changed").describe("changed for how far a change reaches; danger for a failure spreading."),
  rings: z.number().int().min(1).max(5).default(3).describe("The front plus the echoes that trail it."),
});

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
