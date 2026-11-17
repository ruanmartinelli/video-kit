import type { ReactNode } from "react";
import { nodeShapeSchema, type NodeShape } from "../kit/shapeNames";

/**
 * The colors a flat shape is drawn with. Each is a CSS color.
 */
export type ShapeProps = {
  /** The main mass. */
  body: string;
  /** Lighter parts that give the silhouette its detail: rims, stands, handles. */
  trim: string;
  /** Dark recesses: bays, screens, openings. */
  inset: string;
  /** Small parts that are always lit: LEDs, lines on a screen. */
  glow: string;
};

/** A plain box with one status light. */
const Service = ({ body, glow }: ShapeProps) => (
  <>
    <rect x={-0.9} y={-0.55} width={1.8} height={1.1} rx={0.16} fill={body} />
    <circle cx={0.62} cy={-0.28} r={0.07} fill={glow} />
  </>
);

/**
 * Every shape is drawn in a box 2 wide and 1.4 tall, centered on the origin,
 * with y running down. Node scales and places it.
 */
export const shapes: Record<NodeShape, (props: ShapeProps) => ReactNode> = Object.fromEntries(nodeShapeSchema.options.map((name) => [name, Service])) as Record<
  NodeShape,
  (props: ShapeProps) => ReactNode
>;
