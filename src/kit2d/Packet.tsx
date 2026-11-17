import type { z } from "zod";
import { span } from "../kit/geometry";
import { lerp3 } from "../kit/motion";
import { packetSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { CLEAR } from "./Pipe";
import { useCamera } from "./World";

type PacketProps = z.input<typeof packetSchema>;

const ARC = 0.45;
const RADIUS = 0.2;
/** Share of the trip, at each end, over which the label fades: beside a node it would sit on that node. */
const LABEL_FADE = 0.25;

/** A request, message or row: the thing the viewer follows from node to node. */
export const Packet = (props: PacketProps) => {
  const { from, to, clear, progress, tone, label } = packetSchema.parse(props);
  const camera = useCamera();

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const [start, end] = span(from, to, clear ?? [CLEAR, CLEAR]);
  const [x, floor] = camera.point(lerp3(start, end, progress));
  // It lifts off the line mid-trip, so it reads as travelling over the pipe and not along it.
  const y = floor - Math.sin(Math.PI * progress) * ARC * camera.scale;
  const color = tone === "neutral" ? theme.neutral : theme[tone];

  return (
    <>
      <circle cx={x} cy={y} r={RADIUS * camera.scale} fill={color} />
      {label ? (
        <text
          x={x}
          y={y - (RADIUS + 0.16) * camera.scale}
          textAnchor="middle"
          fontFamily={theme.sans}
          fontWeight={600}
          fontSize={0.32 * camera.scale}
          fill={tone === "danger" ? theme.danger : theme.text}
          opacity={Math.min(1, progress / LABEL_FADE, (1 - progress) / LABEL_FADE)}
        >
          {label}
        </text>
      ) : null}
    </>
  );
};
