// Scratch: table design directions, rendered side by side to pick one. Not part of the kit.
import { Billboard, Outlines, RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import { CameraRig, Node, NODE_HEIGHT, Packet, Pipe, Table, TABLE_CLEAR, tableFrame, tableRow, theme, World, type Vec3 } from "../kit";
import { Type } from "../kit/Label";

type Column = { name: string; type: string; change?: "added"; lit?: number };
type Spec = { name: string; change?: "added"; columns: Column[] };

const USERS: Spec = {
  name: "users",
  columns: [
    { name: "id", type: "bigint pk" },
    { name: "email", type: "text" },
    { name: "api_key_limit", type: "int not null = 5", change: "added" },
  ],
};
const API_KEYS: Spec = {
  name: "api_keys",
  change: "added",
  columns: [
    { name: "id", type: "bigint pk" },
    { name: "user_id", type: "bigint → users.id", lit: 1 },
    { name: "key_hash", type: "text not null" },
    { name: "created_at", type: "timestamptz" },
  ],
};

const db: Vec3 = [-7, NODE_HEIGHT / 2, 0];
const usersAt: Vec3 = [-0.6, 0, 0];
const apiKeysAt: Vec3 = [5.4, 0, 0];
const Database = () => <Node position={db} label="Postgres" shape="database" />;

/** 1. The current one: a board leaning on a leg. */
const Tent = () => (
  <World>
    <CameraRig sway={0} shots={[{ at: 0, targets: [db, ...tableFrame(usersAt, USERS.columns), ...tableFrame(apiKeysAt, API_KEYS.columns)], elevation: 30, padding: 1, shift: [0, -0.06] }]} />
    <Database />
    <Table position={usersAt} {...USERS} />
    <Table position={apiKeysAt} {...API_KEYS} />
    <Pipe from={tableRow(apiKeysAt, API_KEYS.columns, "user_id")} to={tableRow(usersAt, USERS.columns, "id")} clear={[TABLE_CLEAR, TABLE_CLEAR]} tone="added" />
    <Packet from={db} to={tableRow(apiKeysAt, API_KEYS.columns, "user_id")} clear={[1.1, 0.35]} progress={0.86} tone="accent" />
  </World>
);

/** 2. The same board lying flat on the floor, like a tile. */
const Floor = () => {
  const flat = (at: Vec3, spec: Spec) => (
    <group position={[at[0], 0.02, at[2] + 1.4]} rotation={[-Math.PI / 3, 0, 0]}>
      <Table position={[0, 0, 0]} {...spec} />
    </group>
  );
  return (
    <World>
      <CameraRig sway={0} shots={[{ at: 0, targets: [db, [-3, 0, -1.6], [8, 0, 1.6]], elevation: 52, padding: 0.95, shift: [0, -0.05] }]} />
      <Database />
      {flat(usersAt, USERS)}
      {flat(apiKeysAt, API_KEYS)}
      <Packet from={db} to={[apiKeysAt[0], 0.5, 0.3]} clear={[1.1, 0.2]} progress={0.86} tone="accent" />
    </World>
  );
};

const DRAWER = 0.52;
const CABINET_WIDTH = 4.4;
const CABINET_DEPTH = 1.5;

/** 3. A cabinet: one drawer per column. A new column is a drawer sliding in, a query pulls one open. */
const Cabinet = ({ position, spec }: { position: Vec3; spec: Spec }) => {
  const height = spec.columns.length * DRAWER + 0.16;
  const outline = <Outlines thickness={spec.change ? 7 : 3} color={spec.change ? theme.added : theme.edge} />;
  return (
    <group position={position}>
      <RoundedBox args={[CABINET_WIDTH, height, CABINET_DEPTH]} radius={0.1} smoothness={4} position={[0, height / 2, 0]}>
        <meshStandardMaterial color={theme.surface} roughness={0.5} />
        {outline}
      </RoundedBox>
      {spec.columns.map((column, index) => {
        const y = height - 0.08 - DRAWER * (index + 0.5);
        const pulled = column.lit ? 0.5 : column.change ? 0.22 : 0;
        const tint = column.lit ? theme.accent : theme.inset;
        return (
          <group key={column.name} position={[0, y, CABINET_DEPTH / 2 + pulled]}>
            <RoundedBox args={[CABINET_WIDTH - 0.24, DRAWER - 0.08, 0.1 + pulled * 2]} radius={0.04} smoothness={3} position={[0, 0, -pulled]}>
              <meshStandardMaterial color={tint} roughness={0.6} />
              {column.change ? <Outlines thickness={5} color={theme.added} /> : null}
            </RoundedBox>
            <Type position={[-CABINET_WIDTH / 2 + 0.34, 0, 0.06]} size={0.23} font="mono" color={column.change ? theme.added : theme.onSurface} anchorX="left" anchorY="middle">
              {column.name}
            </Type>
            <Type position={[CABINET_WIDTH / 2 - 0.34, 0, 0.06]} size={0.17} font="mono" color={column.lit ? theme.onSurface : theme.onSurfaceDim} anchorX="right" anchorY="middle">
              {column.type}
            </Type>
          </group>
        );
      })}
      <Billboard position={[0, height + 0.42, 0]}>
        <Type size={0.4}>{spec.name}</Type>
      </Billboard>
    </group>
  );
};

const Cabinets = () => (
  <World>
    <CameraRig sway={0} shots={[{ at: 0, targets: [db, [-2.8, 0, 0], [7.6, 2.6, 0]], elevation: 20, azimuth: -10, padding: 1, shift: [0, -0.04] }]} />
    <Database />
    <Cabinet position={usersAt} spec={USERS} />
    <Cabinet position={apiKeysAt} spec={API_KEYS} />
    <Packet from={db} to={[apiKeysAt[0], 1.45, 1.6]} clear={[1.1, 0.3]} progress={0.86} tone="accent" />
  </World>
);

const CARD_WIDTH = 4.6;
const CARD_ROW = 0.5;
const CARD_HEADER = 0.66;

/** 4. A glass card floating over a small base, always facing the camera. */
const Card = ({ position, spec }: { position: Vec3; spec: Spec }) => {
  const height = CARD_HEADER + spec.columns.length * CARD_ROW + 0.1;
  const bottom = 1.1;
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.08, 48]} />
        <meshStandardMaterial color={theme.surface} roughness={0.5} />
        <Outlines thickness={3} color={theme.edge} />
      </mesh>
      <mesh position={[0, bottom / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, bottom, 12]} />
        <meshStandardMaterial color={theme.pipe} />
      </mesh>
      <Billboard position={[0, bottom + height / 2, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[CARD_WIDTH + (spec.change ? 0.12 : 0.05), height + (spec.change ? 0.12 : 0.05)]} />
          <meshBasicMaterial color={spec.change ? theme.added : theme.pipe} toneMapped={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[CARD_WIDTH, height]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
        <Type position={[-CARD_WIDTH / 2 + 0.3, height / 2 - CARD_HEADER / 2, 0.05]} size={0.34} anchorX="left" anchorY="middle">
          {spec.name}
        </Type>
        {spec.columns.map((column, index) => {
          const y = height / 2 - CARD_HEADER - CARD_ROW * (index + 0.5);
          const wash = column.lit ? theme.accent : column.change ? theme.added : undefined;
          return (
            <group key={column.name} position={[0, y, 0.035]}>
              <mesh position={[0, CARD_ROW / 2, 0]}>
                <planeGeometry args={[CARD_WIDTH - 0.3, 0.012]} />
                <meshBasicMaterial color={theme.grid} toneMapped={false} />
              </mesh>
              {wash ? (
                <mesh>
                  <planeGeometry args={[CARD_WIDTH - 0.16, CARD_ROW - 0.06]} />
                  <meshBasicMaterial color={wash} toneMapped={false} transparent opacity={column.lit ? 0.45 : 0.16} />
                </mesh>
              ) : null}
              <Type position={[-CARD_WIDTH / 2 + 0.3, 0, 0.01]} size={0.23} font="mono" color={column.change ? theme.added : theme.text} anchorX="left" anchorY="middle">
                {column.name}
              </Type>
              <Type position={[CARD_WIDTH / 2 - 0.3, 0, 0.01]} size={0.17} font="mono" color={theme.textDim} anchorX="right" anchorY="middle">
                {column.type}
              </Type>
            </group>
          );
        })}
      </Billboard>
    </group>
  );
};

const Cards = () => (
  <World>
    <CameraRig sway={0} shots={[{ at: 0, targets: [db, [-2.9, 0, 0], [7.7, 4, 0]], elevation: 16, azimuth: -8, padding: 1, shift: [0, -0.02] }]} />
    <Database />
    <Card position={usersAt} spec={USERS} />
    <Card position={apiKeysAt} spec={API_KEYS} />
    <Packet from={db} to={[apiKeysAt[0], 2.45, 0.3]} clear={[1.1, 0.3]} progress={0.86} tone="accent" />
  </World>
);

/** 5. No 3D table at all: a flat panel over the scene, like the code panel. */
const Panel = ({ spec }: { spec: Spec }) => (
  <div
    style={{
      width: 620,
      borderRadius: 14,
      overflow: "hidden",
      background: theme.panel,
      border: `2px solid ${spec.change ? theme.added : theme.panelBorder}`,
      fontFamily: theme.mono,
      fontWeight: 500,
    }}
  >
    <div style={{ padding: "18px 28px", fontFamily: theme.sans, fontWeight: 600, fontSize: 34, color: theme.text, borderBottom: `2px solid ${theme.panelBorder}` }}>
      {spec.name}
    </div>
    {spec.columns.map((column) => (
      <div
        key={column.name}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "13px 28px",
          fontSize: 27,
          color: column.change ? theme.added : theme.text,
          background: column.lit ? `color-mix(in srgb, ${theme.accent} 28%, transparent)` : column.change ? `color-mix(in srgb, ${theme.added} 10%, transparent)` : "transparent",
          boxShadow: column.change ? `inset 5px 0 0 ${theme.added}` : column.lit ? `inset 5px 0 0 ${theme.accent}` : "none",
        }}
      >
        <span>{column.name}</span>
        <span style={{ fontSize: 21, color: theme.textDim }}>{column.type}</span>
      </div>
    ))}
  </div>
);

const Overlay = () => (
  <World
    overlay={
      <div style={{ position: "absolute", top: 150, right: 110, display: "flex", gap: 36, alignItems: "flex-start" }}>
        <Panel spec={USERS} />
        <Panel spec={API_KEYS} />
      </div>
    }
  >
    <CameraRig sway={0} shots={[{ at: 0, targets: [db], view: "close", padding: 2.2, shift: [-0.36, -0.12] }]} />
    <Database />
    <Packet from={db} to={[db[0] + 5, db[1] + 1.2, -1]} clear={[1.1, 0]} progress={0.7} tone="accent" />
  </World>
);

export const tableDirections: { id: string; component: () => ReactNode }[] = [
  { id: "TableDir1Tent", component: Tent },
  { id: "TableDir2Floor", component: Floor },
  { id: "TableDir3Cabinet", component: Cabinets },
  { id: "TableDir4Card", component: Cards },
  { id: "TableDir5Overlay", component: Overlay },
];
