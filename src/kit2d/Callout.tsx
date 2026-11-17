import type { z } from "zod";
import { useDim } from "../kit/Focus";
import { calloutSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { useCamera } from "./World";

type CalloutProps = z.input<typeof calloutSchema>;

const SIZE = 0.36;
/** Width of a Geist Mono character, as a share of its size. */
const CHAR_WIDTH = 0.6;
const PAD = 0.16;

/** A note tied to a point in the world by a leader line. It draws over whatever is behind it. */
export const Callout = (props: CalloutProps) => {
  const { id, at, children, offset, tone, appear } = calloutSchema.parse(props);
  const dim = useDim(id);
  const camera = useCamera();

  if (appear <= 0) {
    return null;
  }

  const [x, y] = camera.point(at);
  const scale = camera.scale;
  const grow = Math.min(1, appear * 2);
  const reveal = Math.max(0, appear * 2 - 1);
  const color = tone === "neutral" ? theme.textDim : theme[tone];
  const side = offset[0] < 0 ? -1 : 1;
  const width = (children.length * SIZE * CHAR_WIDTH + 2 * PAD) * scale;
  const height = (SIZE + 2 * PAD) * scale;
  // `offset` is [right, up], and the screen's y runs down.
  const endX = x + offset[0] * scale;
  const endY = y - offset[1] * scale;
  // A note that would run off the frame slides back in, so its words are never cut.
  const noteX = Math.min(camera.width - 24 - width, Math.max(24, side > 0 ? endX : endX - width));

  return (
    <g opacity={1 - 0.75 * dim}>
      <circle cx={x} cy={y} r={0.09 * scale * Math.min(1, appear * 4)} fill={color} />
      <line x1={x} y1={y} x2={x + offset[0] * scale * grow} y2={y - offset[1] * scale * grow} stroke={color} strokeWidth={2.5} />
      {reveal > 0 ? (
        <g opacity={reveal}>
          <rect x={noteX} y={endY - height / 2} width={width} height={height} rx={0.1 * scale} fill={theme.background} stroke={color} strokeWidth={2} />
          <text
            x={noteX + PAD * scale}
            y={endY}
            dominantBaseline="central"
            fontFamily={theme.mono}
            fontWeight={500}
            fontSize={SIZE * scale}
            fill={tone === "neutral" ? theme.text : color}
          >
            {children}
          </text>
        </g>
      ) : null}
    </g>
  );
};
