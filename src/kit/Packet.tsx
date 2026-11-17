import { Billboard } from "@react-three/drei";
import { z } from "zod";
import { span } from "./geometry";
import { Type } from "./Label";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";
import { packetSchema } from "./schemas";

export { packetSchema };

type PacketProps = z.input<typeof packetSchema>;

const ARC_HEIGHT = 0.45;
const RADIUS = 0.22;
/** Share of the trip, at each end, over which the label fades: beside a node it would sit on that node's own label. */
const LABEL_FADE = 0.25;

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
          <Type
            size={0.3}
            color={tone === "danger" ? theme.danger : theme.text}
            opacity={Math.min(1, progress / LABEL_FADE, (1 - progress) / LABEL_FADE)}
            onTop
          >
            {label}
          </Type>
        </Billboard>
      ) : null}
    </group>
  );
};
