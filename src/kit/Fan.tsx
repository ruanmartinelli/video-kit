import { z } from "zod";
import { span } from "./geometry";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";
import { fanSchema } from "./schemas";

export { fanSchema };

type FanProps = z.input<typeof fanSchema>;

const ARC_HEIGHT = 0.45;
const RADIUS = 0.15;

/** One request becoming many, or many collapsing into one: fan-out, batching, dedupe. */
export const Fan = (props: FanProps) => {
  const { from, to, direction, progress, tone, stagger, clear } = fanSchema.parse(props);

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const last = to.length - 1;
  // Each trip lasts `window` of the whole; the starts spread over the rest.
  const window = 1 - stagger * (last / (last + 1));

  return (
    <>
      {to.map((target, index) => {
        const local = (progress - (index / last) * (1 - window)) / window;
        if (local <= 0 || local >= 1) {
          return null;
        }
        const [one, many] = span(from, target, clear);
        const [start, end] = direction === "split" ? [one, many] : [many, one];
        const [x, y, z] = lerp3(start, end, local);
        return (
          <mesh key={index} position={[x, y + Math.sin(Math.PI * local) * ARC_HEIGHT, z]}>
            <sphereGeometry args={[RADIUS, 24, 24]} />
            <meshStandardMaterial color={theme[tone]} emissive={theme[tone]} emissiveIntensity={2 * theme.glow} />
          </mesh>
        );
      })}
    </>
  );
};
