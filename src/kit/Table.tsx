import { Billboard } from "@react-three/drei";
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

const HEADER_HEIGHT = 0.62;
const ROW_HEIGHT = 0.5;
const BORDER = 0.05;
const PAD = 0.22;
const MARK_WIDTH = 0.08;

const heightOf = (columns: Columns) =>
  HEADER_HEIGHT + columns.reduce((sum, column) => sum + ROW_HEIGHT * (column.appear ?? 1), 0);

/** Center of a column's row, in the world. Aim pipes and packets at it, with `clear` set to TABLE_CLEAR on that end. */
export const tableRow = (position: Vec3, columns: Columns, name: string): Vec3 => {
  const index = columns.findIndex((column) => column.name === name);
  if (index === -1) {
    throw new Error(`No column "${name}" in table. Columns: ${columns.map((column) => column.name).join(", ")}`);
  }
  const above = heightOf(columns.slice(0, index));
  const own = ROW_HEIGHT * (columns[index]?.appear ?? 1);
  return [position[0], position[1] + heightOf(columns) - above - own / 2, position[2]];
};

/** The table's four corners. Spread them into a shot's `targets` to keep the whole table in frame. */
export const tableFrame = (position: Vec3, columns: Columns): Vec3[] =>
  [-1, 1].flatMap((side) =>
    [0, heightOf(columns)].map((y): Vec3 => [position[0] + (side * TABLE_WIDTH) / 2, position[1] + y, position[2]]),
  );

const Panel = ({ y, z, width, height, color, opacity = 1 }: { y: number; z: number; width: number; height: number; color: Color | string; opacity?: number }) => (
  <mesh position={[0, y, z]}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial color={color} toneMapped={false} transparent={opacity < 1} opacity={opacity} />
  </mesh>
);

/**
 * A database table as a standing card: its name, then one row per column.
 * It turns to face the camera, so its text is always readable.
 */
export const Table = (props: TableProps) => {
  const { id, position, name, columns, change, appear } = tableSchema.parse(props);
  const dim = useDim(id);

  if (appear <= 0) {
    return null;
  }

  const dimmed = (color: string) => new Color(color).lerp(new Color(theme.dimmed), dim);
  const fade = 1 - 0.7 * dim;
  const height = heightOf(columns);
  let top = height - HEADER_HEIGHT;

  return (
    <group position={position} scale={appear}>
      <Billboard lockX lockZ>
        <Panel y={height / 2} z={-0.02} width={TABLE_WIDTH + 2 * BORDER} height={height + 2 * BORDER} color={dimmed(change ? theme[change] : theme.edge)} />
        <Panel y={height / 2} z={-0.01} width={TABLE_WIDTH} height={height} color={dimmed(theme.card)} />
        <Panel y={height - HEADER_HEIGHT / 2} z={0} width={TABLE_WIDTH} height={HEADER_HEIGHT} color={dimmed(theme.surface)} />
        <Type position={[-TABLE_WIDTH / 2 + PAD, height - HEADER_HEIGHT / 2, 0.01]} size={0.3} color={theme.onSurface} opacity={fade} anchorX="left" anchorY="middle">
          {name}
        </Type>
        {columns.map((column) => {
          const rowHeight = ROW_HEIGHT * column.appear;
          const y = top - rowHeight / 2;
          top -= rowHeight;
          if (column.appear <= 0) {
            return null;
          }
          const mark = column.change ? theme[column.change] : undefined;
          return (
            <group key={column.name} position={[0, y, 0]}>
              <Panel y={-rowHeight / 2} z={0.001} width={TABLE_WIDTH} height={0.012} color={dimmed(theme.cardLine)} />
              {mark ? (
                <>
                  <Panel y={0} z={0.002} width={TABLE_WIDTH} height={rowHeight} color={mark} opacity={0.14 * (1 - dim)} />
                  <mesh position={[-TABLE_WIDTH / 2 + MARK_WIDTH / 2, 0, 0.004]}>
                    <planeGeometry args={[MARK_WIDTH, rowHeight]} />
                    <meshBasicMaterial color={dimmed(mark)} toneMapped={false} />
                  </mesh>
                </>
              ) : null}
              {column.lit > 0 ? <Panel y={0} z={0.003} width={TABLE_WIDTH} height={rowHeight} color={theme.accent} opacity={0.4 * column.lit * (1 - dim)} /> : null}
              <Type position={[-TABLE_WIDTH / 2 + PAD, 0, 0.01]} size={0.24} font="mono" opacity={fade * column.appear} anchorX="left" anchorY="middle">
                {column.name}
              </Type>
              <Type position={[TABLE_WIDTH / 2 - PAD, 0, 0.01]} size={0.19} font="mono" color={theme.textDim} opacity={fade * column.appear} anchorX="right" anchorY="middle">
                {column.type}
              </Type>
            </group>
          );
        })}
      </Billboard>
    </group>
  );
};
