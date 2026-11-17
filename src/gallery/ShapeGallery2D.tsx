import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../kit/fonts";
import { nodeShapeSchema } from "../kit/shapeNames";
import { theme } from "../kit/theme";
import { shapes } from "../kit2d/shapes";

const NAMES = nodeShapeSchema.options;
const COLUMNS = 6;
const CELL: [number, number] = [300, 250];
/** Pixels per world unit: about what a node gets in a wide shot. */
const SCALE = 95;

export const shapeGallery2DMeta = { id: "ShapeGallery2D", fps: 30, width: 1920, height: 1080, durationInFrames: 2 };

/**
 * Every flat node shape on its plate, at the size a wide shot draws it.
 * Frame 0 is idle, frame 1 is lit. `pnpm stills ShapeGallery2D 0,1 1`.
 * The dashed box is the 2 x 1.4 area a shape may fill.
 */
export const ShapeGallery2D = () => {
  const lit = useCurrentFrame() >= 1;
  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {NAMES.map((name, index) => {
          const Shape = shapes[name];
          const x = 60 + CELL[0] * (index % COLUMNS) + CELL[0] / 2;
          const y = 40 + CELL[1] * Math.floor(index / COLUMNS) + CELL[1] / 2 + 20;
          return (
            <g key={name}>
              <text x={x} y={y - 0.85 * SCALE - 22} textAnchor="middle" fontFamily={theme.sans} fontWeight={600} fontSize={30} fill={theme.text}>
                {name}
              </text>
              <g transform={`translate(${x} ${y}) scale(${SCALE})`}>
                <rect x={-1.15} y={-0.85} width={2.3} height={1.7} rx={0.22} fill={theme.panel} stroke={lit ? theme.accent : theme.edge} strokeWidth={0.05} />
                <g transform="scale(0.82)">
                  <rect x={-1} y={-0.7} width={2} height={1.4} fill="none" stroke={theme.grid} strokeWidth={0.02} strokeDasharray="0.06 0.06" />
                  <Shape
                    body={lit ? `color-mix(in srgb, ${theme.accent} 35%, ${theme.surface})` : theme.surface}
                    trim={theme.pipe}
                    inset={theme.inset}
                    glow={theme.accent}
                  />
                </g>
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
