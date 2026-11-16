import { Billboard } from "@react-three/drei";
import { z } from "zod";
import { span } from "./geometry";
import { Type } from "./Label";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const packetSchema = z.object({
  from: vec3Schema.describe("Center of the node it leaves."),
  to: vec3Schema.describe("Center of the node it reaches."),
  clear: z
    .tuple([z.number().min(0), z.number().min(0)])
    .optional()
    .describe("Distance to stay clear of `from` and `to`. Defaults to a node's edge."),
  progress: unitSchema.describe("0 = leaving `from`, 1 = arriving at `to`. Hidden at exactly 0 and 1."),
  tone: z.enum(["neutral", "accent", "danger"]).default("neutral").describe("White unless the story needs it to stand out or fail."),
  label: z.string().optional().describe("Who or what this one is, riding above it: `admin`, `order 42`. Use it when several packets take the same path and the story depends on telling them apart."),
});

type PacketProps = z.input<typeof packetSchema>;

const ARC_HEIGHT = 0.45;
const RADIUS = 0.22;

/** A request, message or row: the thing the viewer follows from node to node. */
export const Packet = (props: PacketProps) => {
  const { from, to, clear, progress, tone, label } = packetSchema.parse(props);

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const [start, end] = span(from, to, clear);
  const [x, y, z] = lerp3(start, end, progress);

  return (
    <group position={[x, y + Math.sin(Math.PI * progress) * ARC_HEIGHT, z]}>
      <mesh>
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshStandardMaterial color={theme[tone]} emissive={theme[tone]} emissiveIntensity={2 * theme.glow} />
      </mesh>
      {label ? (
        <Billboard position={[0, RADIUS + 0.14, 0]}>
          <Type size={0.3} color={tone === "danger" ? theme.danger : theme.text}>
            {label}
          </Type>
        </Billboard>
      ) : null}
    </group>
  );
};
