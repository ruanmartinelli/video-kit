import type { z } from "zod";
import { useDim } from "../kit/Focus";
import { span } from "../kit/geometry";
import { lerp3, type Vec3 } from "../kit/motion";
import { gateSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { CLEAR } from "./Pipe";
import { useCamera } from "./World";

type GateProps = z.input<typeof gateSchema>;

const RADIUS = 0.5;
/** From the ring's center to the bottom of its rule: above a packet's label when the packet is at the ring. */
const RULE_LIFT = 1.25;

const mix = (from: string, to: string, amount: number) => `color-mix(in srgb, ${to} ${Math.round(100 * Math.min(1, Math.max(0, amount)))}%, ${from})`;

/** The ring's center: where a Packet stops to be checked. Send one with `clear` [NODE_CLEAR, 0] to it, then on with [0, NODE_CLEAR] or back. */
export const gatePoint = (from: Vec3, to: Vec3, at = 0.5): Vec3 => {
  const [start, end] = span(from, to, [CLEAR, CLEAR]);
  return lerp3(start, end, at);
};

/** A condition on a connection: a ring on the pipe, with its rule above it. Packets that match go through; the rest bounce back. */
export const Gate = (props: GateProps) => {
  const { id, from, to, at, rule, active, tone, appear } = gateSchema.parse(props);
  const dim = useDim(id);
  const camera = useCamera();

  if (appear <= 0) {
    return null;
  }

  const [x, y] = camera.point(gatePoint(from, to, at));
  const scale = camera.scale * appear;
  const lit = active * (1 - dim);

  return (
    <g opacity={1 - 0.75 * dim}>
      <circle
        cx={x}
        cy={y}
        r={RADIUS * scale * (1 + 0.12 * lit)}
        fill={theme.background}
        style={{ stroke: mix(theme.edge, theme[tone], lit) }}
        strokeWidth={0.15 * scale}
      />
      <circle cx={x} cy={y} r={(RADIUS + 0.2) * scale} fill={theme[tone]} opacity={0.14 * lit} />
      {rule ? (
        <text
          x={x}
          y={y - RULE_LIFT * scale}
          textAnchor="middle"
          fontFamily={theme.mono}
          fontWeight={500}
          fontSize={0.36 * scale}
          style={{ fill: mix(theme.textDim, theme[tone], lit) }}
        >
          {rule}
        </text>
      ) : null}
    </g>
  );
};
