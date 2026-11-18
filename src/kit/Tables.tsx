import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

const changeSchema = z.enum(["added", "changed", "removed"]);

export const columnSchema = z.object({
  name: z.string(),
  type: z.string().describe("Shown dim on the right: the SQL type, plus what matters about it (`int not null`). Keep it under ~18 characters."),
  change: changeSchema.optional().describe("What the change being shown did to this column."),
  appear: unitSchema.default(1).describe("0 = not there, 1 = fully in. The rows below slide down as it grows."),
  lit: unitSchema.default(0).describe("0 = idle, 1 = a query is touching it right now. Pulse it on the frame the query's packet reaches the database."),
});

export const tableSchema = z.object({
  name: z.string(),
  columns: z.array(columnSchema).describe("Only the columns the story needs, top to bottom."),
  change: changeSchema.optional().describe("What the change being shown did to the whole table."),
  appear: z.number().min(0).default(1).describe("0 = not there, 1 = fully in. Drive with pop(). Its place is kept while it is out."),
});

export const linkSchema = z.object({
  from: z.string().describe("`table.column` the link starts at, usually the foreign key."),
  to: z.string().describe("`table.column` it points to. Link tables that sit next to each other."),
  tone: z.enum(["neutral", "added", "changed", "removed"]).default("neutral"),
  progress: unitSchema.default(1).describe("How much of the link is drawn, growing out of `from`."),
});

export const tablesSchema = z.object({
  tables: z.array(tableSchema).min(1).describe("Up to 3 in a column, or 2 in a row, before they crowd the frame."),
  links: z.array(linkSchema).default([]),
  direction: z.enum(["column", "row"]).default("column").describe("column stacks them and leaves most of the frame to the 3D scene; row reads more like a diagram."),
  side: z.enum(["left", "right"]).default("right").describe("Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type TablesProps = z.input<typeof tablesSchema>;
type Table = z.output<typeof tableSchema>;

const WIDTH = 520;
const HEADER = 72;
const ROW = 54;
const GAP = 32;
const BULGE = 64;

const rowsHeight = (columns: Table["columns"]) => columns.reduce((sum, column) => sum + ROW * column.appear, 0);
const heightOf = (table: Table) => HEADER + rowsHeight(table.columns);

/**
 * Database tables as flat panels over the scene: a name, then one row per
 * column. Flat because column names and types have to be read, and text in the
 * 3D world is skewed and small. Anything shaped like a schema fits: a GraphQL
 * type is a table named `type User` whose columns are its fields. Goes in
 * World's `overlay`.
 */
export const Tables = (props: TablesProps) => {
  const { tables, links, direction, side, appear } = tablesSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  // Every position is worked out from the data, so links can be drawn without measuring the page.
  let offset = 0;
  const placed = tables.map((table) => {
    const at = direction === "column" ? { left: 0, top: offset } : { left: offset, top: 0 };
    offset += (direction === "column" ? heightOf(table) : WIDTH) + GAP;
    return { table, ...at };
  });
  const width = direction === "column" ? WIDTH : offset - GAP;
  const height = direction === "column" ? offset - GAP : Math.max(...tables.map(heightOf));

  const rowOf = (address: string) => {
    const [tableName, columnName] = address.split(".");
    const index = placed.findIndex(({ table }) => table.name === tableName);
    const found = placed[index];
    const columnIndex = found?.table.columns.findIndex((column) => column.name === columnName) ?? -1;
    if (!found || columnIndex === -1) {
      throw new Error(`Link names "${address}", which is not a table.column in these tables`);
    }
    const above = rowsHeight(found.table.columns.slice(0, columnIndex));
    const own = ROW * (found.table.columns[columnIndex]?.appear ?? 1);
    return { index, left: found.left, y: found.top + HEADER + above + own / 2 };
  };

  const slide = (1 - appear) * (side === "right" ? 60 : -60);

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        width,
        height,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      {placed.map(({ table, left, top }) => (
        <div
          key={table.name}
          style={{
            position: "absolute",
            left,
            top,
            width: WIDTH,
            boxSizing: "border-box",
            borderRadius: 14,
            overflow: "hidden",
            background: theme.panel,
            border: `2px solid ${table.change ? theme[table.change] : theme.panelBorder}`,
            opacity: Math.min(1, table.appear),
            transform: `scale(${table.appear})`,
          }}
        >
          <div
            style={{
              height: HEADER - 2,
              boxSizing: "border-box",
              padding: "0 26px",
              display: "flex",
              alignItems: "center",
              fontFamily: theme.sans,
              fontWeight: 600,
              fontSize: 32,
              color: table.change ? theme[table.change] : theme.text,
              borderBottom: `2px solid ${theme.panelBorder}`,
            }}
          >
            {table.name}
          </div>
          {table.columns.map((column) => {
            const mark = column.change ? theme[column.change] : undefined;
            const wash = column.lit > 0 ? `color-mix(in srgb, ${theme.accent} ${Math.round(34 * column.lit)}%, transparent)` : mark ? `color-mix(in srgb, ${mark} 10%, transparent)` : "transparent";
            return (
              <div
                key={column.name}
                style={{
                  height: ROW * column.appear,
                  opacity: column.appear,
                  overflow: "hidden",
                  boxSizing: "border-box",
                  padding: "0 26px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  whiteSpace: "nowrap",
                  fontSize: 25,
                  color: mark ?? theme.text,
                  textDecoration: column.change === "removed" ? "line-through" : "none",
                  background: wash,
                  boxShadow: mark ? `inset 5px 0 0 ${mark}` : column.lit > 0 ? `inset 5px 0 0 ${theme.accent}` : "none",
                }}
              >
                <span>{column.name}</span>
                <span style={{ fontSize: 19, color: theme.textDim }}>{column.type}</span>
              </div>
            );
          })}
        </div>
      ))}
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {links.map((link) => {
          if (link.progress <= 0) {
            return null;
          }
          const from = rowOf(link.from);
          const to = rowOf(link.to);
          const color = link.tone === "neutral" ? theme.textDim : theme[link.tone];
          // In a column the link loops out past the outer edge; in a row it crosses the gap between the two tables.
          const outer = side === "right" ? 0 : WIDTH;
          const out = side === "right" ? -BULGE : BULGE;
          const leftward = from.left > to.left;
          const startX = direction === "column" ? outer : from.left + (leftward ? 0 : WIDTH);
          const endX = direction === "column" ? outer : to.left + (leftward ? WIDTH : 0);
          const pull = direction === "column" ? out : (endX - startX) / 2;
          const path = `M ${startX} ${from.y} C ${startX + pull} ${from.y}, ${endX - (direction === "column" ? -out : pull)} ${to.y}, ${endX} ${to.y}`;
          return (
            <g key={`${link.from}>${link.to}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round">
              <path d={path} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - link.progress} />
              <circle cx={startX} cy={from.y} r={6} fill={color} stroke="none" />
              {link.progress >= 1 ? <circle cx={endX} cy={to.y} r={6} fill={color} stroke="none" /> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
