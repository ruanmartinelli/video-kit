import type { z } from "zod";
import { useDim } from "../kit/Focus";
import { span } from "../kit/geometry";
import { lerp3 } from "../kit/motion";
import { pipeSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { useCamera } from "./World";

type PipeProps = z.input<typeof pipeSchema>;

/** From a node's center to the edge of its plate, with a little air. */
export const CLEAR = 1.3;

/** A connection between two nodes. */
export const Pipe = (props: PipeProps) => {
  const { id, from, to, clear, tone, progress, label } = pipeSchema.parse(props);
  const dim = useDim(id);
  const camera = useCamera();

  if (progress <= 0) {
    return null;
  }

  const [start, end] = span(from, to, clear ?? [CLEAR, CLEAR]);
  const [x1, y1] = camera.point(start);
  const [x2, y2] = camera.point(lerp3(start, end, progress));
  const [mx, my] = camera.point(lerp3(start, end, 0.5));
  const color = tone === "neutral" ? theme.pipe : theme[tone];

  return (
    <g opacity={1 - 0.75 * dim}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={Math.max(2.5, 0.045 * camera.scale)} strokeLinecap="round" />
      {label ? (
        // Under the line: packets and their labels own the space above it.
        <text
          x={mx}
          y={my + 0.62 * camera.scale}
          textAnchor="middle"
          fontFamily={theme.mono}
          fontWeight={500}
          fontSize={0.36 * camera.scale}
          fill={tone === "neutral" ? theme.textDim : color}
          opacity={Math.max(0, 2 * progress - 1)}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
