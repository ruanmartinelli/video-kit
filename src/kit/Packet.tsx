import { z } from "zod";
import { span } from "./geometry";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const packetSchema = z.object({
  from: vec3Schema.describe("Center of the node it leaves."),
  to: vec3Schema.describe("Center of the node it reaches."),
  progress: unitSchema.describe("0 = leaving `from`, 1 = arriving at `to`. Hidden at exactly 0 and 1."),
  tone: z.enum(["accent", "danger"]).default("accent"),
});

type PacketProps = z.input<typeof packetSchema>;

const ARC_HEIGHT = 0.45;

/** A request, message or row: the thing the viewer follows from node to node. */
export const Packet = (props: PacketProps) => {
  const { from, to, progress, tone } = packetSchema.parse(props);

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const [start, end] = span(from, to);
  const [x, y, z] = lerp3(start, end, progress);

  return (
    <mesh position={[x, y + Math.sin(Math.PI * progress) * ARC_HEIGHT, z]}>
      <sphereGeometry args={[0.22, 32, 32]} />
      <meshStandardMaterial color={theme[tone]} emissive={theme[tone]} emissiveIntensity={2} />
    </mesh>
  );
};
