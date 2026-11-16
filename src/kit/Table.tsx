import { Outlines, RoundedBox } from "@react-three/drei";
import { Color } from "three";
import { z } from "zod";
import { useDim } from "./Focus";
import { Type } from "./Label";
import { unitSchema, vec3Schema, type Vec3 } from "./motion";
import { theme } from "./theme";

const changeSchema = z.enum(["added", "changed", "removed"]);

export const columnSchema = z.object({
  name: z.string(),
  type: z.string().describe("Shown dim on the right: the SQL type, plus what matters about it (`int not null`)."),
  change: changeSchema.optional().describe("What the PR did to this column."),
  appear: unitSchema.default(1).describe("0 = not there, 1 = fully in. The rows below slide down as it grows."),
  lit: unitSchema.default(0).describe("0 = idle, 1 = a query is touching it right now."),
});

export const tableSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this table lit."),
  position: vec3Schema.describe("Center of the bottom edge. y = 0 stands it on the floor."),
  name: z.string(),
  columns: z.array(columnSchema).describe("Only the columns the story needs, top to bottom. Past ~7 the text gets small on screen."),
  change: changeSchema.optional().describe("What the PR did to the whole table."),
  appear: z.number().min(0).default(1).describe("0 = not in the scene, 1 = fully there. Drive with pop()."),
});

type TableProps = z.input<typeof tableSchema>;
type Columns = TableProps["columns"];

export const TABLE_WIDTH = 5;
/** How far from a row's center a pipe or packet has to stop to be outside the table. */
export const TABLE_CLEAR = TABLE_WIDTH / 2 + 0.15;

// The table is a board leaning back on a leg, like a tent card, so its face
// meets the camera's usual downward look square on.
const LEAN = (30 * Math.PI) / 180;
const LEG_LEAN = (20 * Math.PI) / 180;
const THICKNESS = 0.26;
const LEG_THICKNESS = 0.12;
const LIFT = THICKNESS * Math.sin(LEAN);

const HEADER_HEIGHT = 0.7;
const ROW_HEIGHT = 0.5;
const ROW_GAP = 0.07;
const FOOT = 0.12;
const SIDE = 0.16;
const PAD = 0.2;
const MARK_WIDTH = 0.09;
const OUTLINE_THICKNESS = 3;
const CHANGE_OUTLINE_THICKNESS = 7;

/** Length of the board's face, bottom edge to top edge. */
const faceOf = (columns: Columns) =>
  HEADER_HEIGHT + FOOT + columns.reduce((sum, column) => sum + ROW_HEIGHT * (column.appear ?? 1), 0);

/** A point on the board's face, `along` up from its bottom edge and `across` from its middle, in the world. */
const onFace = (position: Vec3, across: number, along: number): Vec3 => [
  position[0] + across,
  position[1] + LIFT + along * Math.cos(LEAN),
  position[2] - along * Math.sin(LEAN),
];

/** Center of a column's row, in the world. Aim pipes and packets at it, with `clear` set to TABLE_CLEAR on an end that reaches it from the side. */
export const tableRow = (position: Vec3, columns: Columns, name: string): Vec3 => {
  const index = columns.findIndex((column) => column.name === name);
  if (index === -1) {
    throw new Error(`No column "${name}" in table. Columns: ${columns.map((column) => column.name).join(", ")}`);
  }
  const below = columns.slice(index + 1).reduce((sum, column) => sum + ROW_HEIGHT * (column.appear ?? 1), 0);
  const own = ROW_HEIGHT * (columns[index]?.appear ?? 1);
  return onFace(position, 0, FOOT + below + own / 2);
};

/** The table's four corners. Spread them into a shot's `targets` to keep the whole table in frame. */
export const tableFrame = (position: Vec3, columns: Columns): Vec3[] =>
  [-1, 1].flatMap((side) => [0, faceOf(columns)].map((along) => onFace(position, (side * TABLE_WIDTH) / 2, along)));

/**
 * A database table as a board standing on the floor: its name, then one row
 * per column. Shots read it best from an elevation near 30.
 */
export const Table = (props: TableProps) => {
  const { id, position, name, columns, change, appear } = tableSchema.parse(props);
  const dim = useDim(id);

  if (appear <= 0) {
    return null;
  }

  const dimmed = (color: string) => new Color(color).lerp(new Color(theme.dimmed), dim);
  const lit = 1 - dim;
  const fade = 1 - 0.7 * dim;
  const face = faceOf(columns);
  const outline = (
    <Outlines thickness={change ? CHANGE_OUTLINE_THICKNESS : OUTLINE_THICKNESS} color={dimmed(change ? theme[change] : theme.edge)} />
  );

  // The leg runs from the board's top edge down to the floor behind it.
  const top = face * Math.cos(LEAN);
  const legLength = top / Math.cos(LEG_LEAN);
  const topBack = -face * Math.sin(LEAN) - THICKNESS * Math.cos(LEAN);
  let rowTop = face - HEADER_HEIGHT;

  return (
    <group position={position} scale={appear}>
      <group position={[0, LIFT + top / 2, topBack - (top / 2) * Math.tan(LEG_LEAN)]} rotation={[LEG_LEAN, 0, 0]}>
        <RoundedBox args={[TABLE_WIDTH - 1, legLength, LEG_THICKNESS]} radius={0.05} smoothness={3}>
          <meshStandardMaterial color={dimmed(theme.pipe)} roughness={0.5} />
          {outline}
        </RoundedBox>
      </group>
      <group position={[0, LIFT, 0]} rotation={[-LEAN, 0, 0]}>
        <RoundedBox args={[TABLE_WIDTH, face, THICKNESS]} radius={0.1} smoothness={4} position={[0, face / 2, -THICKNESS / 2]}>
          <meshStandardMaterial color={dimmed(theme.surface)} roughness={0.5} />
          {outline}
        </RoundedBox>
        <Type position={[-TABLE_WIDTH / 2 + SIDE + PAD, face - HEADER_HEIGHT / 2, 0.02]} size={0.34} color={theme.onSurface} opacity={fade} anchorX="left" anchorY="middle">
          {name}
        </Type>
        <mesh position={[TABLE_WIDTH / 2 - SIDE - PAD, face - HEADER_HEIGHT / 2, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={dimmed(theme.accent)} emissive={theme.accent} emissiveIntensity={0.9 * theme.glow * lit} />
        </mesh>
        {columns.map((column) => {
          const slot = ROW_HEIGHT * column.appear;
          const y = rowTop - slot / 2;
          rowTop -= slot;
          const height = slot - ROW_GAP;
          if (height <= 0.02) {
            return null;
          }
          const width = TABLE_WIDTH - 2 * SIDE;
          const mark = column.change ? theme[column.change] : undefined;
          return (
            <group key={column.name} position={[0, y, 0]}>
              <RoundedBox args={[width, height, 0.04]} radius={Math.min(0.06, height / 3)} smoothness={3}>
                <meshStandardMaterial
                  color={dimmed(theme.inset).lerp(new Color(theme.accent), 0.55 * column.lit * lit)}
                  emissive={theme.accent}
                  emissiveIntensity={0.5 * column.lit * lit}
                  roughness={0.6}
                />
              </RoundedBox>
              {mark ? (
                <mesh position={[-width / 2 + MARK_WIDTH / 2 + 0.03, 0, 0.022]}>
                  <planeGeometry args={[MARK_WIDTH, height - 0.1]} />
                  <meshBasicMaterial color={dimmed(mark)} toneMapped={false} />
                </mesh>
              ) : null}
              <Type position={[-width / 2 + PAD + (mark ? 0.1 : 0), 0, 0.03]} size={0.24} font="mono" color={mark ?? theme.onSurface} opacity={fade * column.appear} anchorX="left" anchorY="middle">
                {column.name}
              </Type>
              <Type position={[width / 2 - PAD, 0, 0.03]} size={0.18} font="mono" color={theme.onSurfaceDim} opacity={fade * column.appear} anchorX="right" anchorY="middle">
                {column.type}
              </Type>
            </group>
          );
        })}
      </group>
    </group>
  );
};
