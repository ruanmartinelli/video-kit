import { z } from "zod";
import { span } from "./geometry";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const fanSchema = z.object({
  from: vec3Schema.describe("Center of the one: the node that fans out, or that the many collapse into."),
  to: z.array(vec3Schema).min(2).max(12).describe("Centers of the many, one small packet each."),
  direction: z.enum(["split", "merge"]).default("split").describe("split travels from `from` to each of `to`; merge from each of `to` into `from`."),
  progress: unitSchema.describe("0 = all waiting, 1 = all arrived. Hidden at exactly 0 and 1."),
  tone: z.enum(["neutral", "accent", "danger"]).default("neutral").describe("White unless the story needs it to stand out or fail."),
  stagger: unitSchema.default(0).describe("0 = all leave together; 1 = each leaves as the one before arrives. In the order of `to`."),
  clear: z
    .tuple([z.number().min(0), z.number().min(0)])
    .optional()
    .describe("Distance to stay clear of [`from`, each of `to`], whichever way they travel. Defaults to a node's edge."),
});

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
