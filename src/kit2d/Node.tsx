import type { z } from "zod";
import { useDim } from "../kit/Focus";
import { nodeSchema, type nodeStateSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { labelBox } from "./framing";
import { LABEL, PLATE } from "./metrics";
import { shapes } from "./shapes";
import { useCamera } from "./World";

/** What a video sets on a node a Graph draws. */
export type NodeState = z.input<typeof nodeStateSchema>;

type NodeProps = z.input<typeof nodeSchema> & { children?: unknown };

const mix = (from: string, to: string, amount: number) => `color-mix(in srgb, ${to} ${Math.round(100 * Math.min(1, Math.max(0, amount)))}%, ${from})`;

const BADGE_RADIUS = 0.3;

/** A small mark at the plate's top right corner for the state the node is in. */
const Badge = ({ kind }: { kind: "locked" | "syncing" | "failed" | "done" }) => {
  const ink = kind === "failed" ? theme.danger : kind === "done" ? theme.added : theme.text;
  const line = { fill: "none", stroke: ink, strokeWidth: 0.06, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${PLATE.width / 2 - 0.05} ${-PLATE.height / 2 + 0.05})`}>
      <circle r={BADGE_RADIUS} fill={theme.background} stroke={kind === "failed" ? theme.danger : theme.edge} strokeWidth={0.04} />
      {kind === "locked" ? (
        <>
          <rect x={-0.11} y={-0.02} width={0.22} height={0.17} rx={0.03} fill={ink} />
          <path d="M -0.07 -0.02 V -0.08 A 0.07 0.07 0 0 1 0.07 -0.08 V -0.02" {...line} />
        </>
      ) : null}
      {kind === "syncing" ? (
        <>
          <path d="M 0.14 -0.02 A 0.14 0.14 0 0 0 -0.1 -0.1 M -0.14 0.02 A 0.14 0.14 0 0 0 0.1 0.1" {...line} />
          <path d="M -0.15 -0.17 L -0.1 -0.1 L -0.02 -0.14 M 0.15 0.17 L 0.1 0.1 L 0.02 0.14" {...line} />
        </>
      ) : null}
      {kind === "failed" ? <path d="M -0.1 -0.1 L 0.1 0.1 M 0.1 -0.1 L -0.1 0.1" {...line} /> : null}
      {kind === "done" ? <path d="M -0.12 0.01 L -0.03 0.1 L 0.13 -0.09" {...line} /> : null}
    </g>
  );
};

/** A service, process or machine, as a plate with its shape on it and its label above. */
export const Node = (props: NodeProps) => {
  const { id, position, label, shape, change, active, tone, appear, open, badge } = nodeSchema.parse(props);
  const dim = useDim(id);
  const camera = useCamera();

  if (open > 0) {
    throw new Error(
      `"${label}" sets \`open\`, which shows a node's 3D internals. The flat kit cannot: import this video's pieces from "video-kit", or show the internals in a panel.`,
    );
  }
  if (appear <= 0) {
    return null;
  }

  const [x, y] = camera.point(position);
  const scale = camera.scale * appear;
  const lit = active * (1 - dim);
  const toneColor = theme[tone];
  const Shape = shapes[shape];

  // A label the frame edge would cut reads as a mistake, while a plate half out of frame with no label reads as background.
  const text = labelBox(label, [x, y], scale);
  const labelWhole = text.left >= camera.left && text.right <= camera.right && text.top >= 0 && text.bottom <= camera.height;

  return (
    <g opacity={1 - 0.72 * dim}>
      <g transform={`translate(${x} ${y}) scale(${scale * (1 + 0.05 * active)})`}>
        {/* Lit, the plate takes on the tone and a soft halo: no filter, so a frame stays cheap to draw. */}
        <rect
          x={-PLATE.width / 2 - 0.18}
          y={-PLATE.height / 2 - 0.18}
          width={PLATE.width + 0.36}
          height={PLATE.height + 0.36}
          rx={PLATE.radius + 0.18}
          fill={toneColor}
          opacity={0.16 * lit}
        />
        <rect
          x={-PLATE.width / 2}
          y={-PLATE.height / 2}
          width={PLATE.width}
          height={PLATE.height}
          rx={PLATE.radius}
          style={{ fill: mix(theme.panel, toneColor, 0.14 * lit), stroke: mix(change ? theme[change] : theme.edge, toneColor, lit) }}
          strokeWidth={change ? 0.1 : 0.05}
        />
        <g transform="scale(0.82)">
          <Shape body={mix(theme.surface, toneColor, 0.35 * lit)} trim={mix(theme.pipe, toneColor, 0.35 * lit)} inset={theme.inset} glow={toneColor} />
        </g>
        {badge ? <Badge kind={badge} /> : null}
      </g>
      {labelWhole ? (
        <text x={x} y={text.bottom} textAnchor="middle" fontFamily={theme.sans} fontWeight={600} fontSize={LABEL.size * scale} fill={theme.text}>
          {label}
        </text>
      ) : null}
    </g>
  );
};
