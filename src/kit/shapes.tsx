import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import { ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from "three";
import { z } from "zod";
import { NODE_HEIGHT, NODE_WIDTH } from "./geometry";

export const nodeShapeSchema = z.enum([
  "service",
  "database",
  "server",
  "queue",
  "client",
  "user",
  "cloud",
  "storage",
  "file",
  "controller",
  "router",
  "worker",
  "clock",
  "shield",
  "trigger",
  "agent",
  "model",
  "external",
  "phone",
  "notification",
  "key",
  "log",
]);

export type NodeShape = z.infer<typeof nodeShapeSchema>;

/**
 * The materials a shape is built from. Each is a material element, so a shape
 * drops it into as many meshes as it has.
 */
type ShapeProps = {
  /** The main mass. */
  body: ReactNode;
  /** Lighter parts that give the silhouette its detail: rims, stands, handles. */
  trim: ReactNode;
  /** Dark recesses: bays, screens, openings. */
  inset: ReactNode;
  /** Small parts that are always lit: LEDs, lines on a screen. */
  glow: ReactNode;
};

const FLOOR = -NODE_HEIGHT / 2;
const TOP = NODE_HEIGHT / 2;

type Profile = [radius: number, y: number][];

/** Quarter circle from `from` to `to`, bulging away from `corner`'s opposite side. */
const arc = (center: [number, number], radius: number, fromDegrees: number, toDegrees: number): Profile =>
  Array.from({ length: 7 }, (_, step) => {
    const angle = ((fromDegrees + ((toDegrees - fromDegrees) * step) / 6) * Math.PI) / 180;
    return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
  });

/** A solid of revolution around the y axis. */
const turned = (profile: Profile) =>
  new LatheGeometry(
    profile.map(([radius, y]) => new Vector2(radius, y)),
    64,
  );

/** A cylinder with rounded edges, centered on the origin. */
const disk = (radius: number, height: number, bevel: number) =>
  turned([
    [0, -height / 2],
    ...arc([radius - bevel, -height / 2 + bevel], bevel, -90, 0),
    ...arc([radius - bevel, height / 2 - bevel], bevel, 0, 90),
    [0, height / 2],
  ]);

const Led = ({ position, glow }: { position: [number, number, number]; glow: ReactNode }) => (
  <mesh position={position}>
    <sphereGeometry args={[0.05, 16, 16]} />
    {glow}
  </mesh>
);

/** A plain box with one status light. */
const Service = ({ body, glow }: ShapeProps) => (
  <>
    <RoundedBox args={[NODE_WIDTH, NODE_HEIGHT, NODE_WIDTH]} radius={0.16} smoothness={4}>
      {body}
    </RoundedBox>
    <Led position={[0.7, 0.34, NODE_WIDTH / 2]} glow={glow} />
  </>
);

const PLATTER = disk(0.88, 0.34, 0.07);
const PLATTER_YS = [-0.42, 0, 0.42];

/** Three stacked platters. */
const Database = ({ body, trim, glow }: ShapeProps) => (
  <>
    <mesh>
      <cylinderGeometry args={[0.78, 0.78, NODE_HEIGHT - 0.2, 48]} />
      {trim}
    </mesh>
    {PLATTER_YS.map((y) => (
      <group key={y} position={[0, y, 0]}>
        <mesh geometry={PLATTER}>{body}</mesh>
        <Led position={[0.88 * Math.sin(0.5), 0, 0.88 * Math.cos(0.5)]} glow={glow} />
      </group>
    ))}
  </>
);

const SERVER_DEPTH = 1.7;

/** A rack: three drive bays on the front, each with a handle and status lights. */
const Server = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <RoundedBox args={[1.6, NODE_HEIGHT, SERVER_DEPTH]} radius={0.08} smoothness={4}>
      {body}
    </RoundedBox>
    {[-0.36, 0, 0.36].map((y) => (
      <group key={y} position={[0, y, SERVER_DEPTH / 2]}>
        <RoundedBox args={[1.36, 0.27, 0.04]} radius={0.02} smoothness={2}>
          {inset}
        </RoundedBox>
        <RoundedBox args={[0.55, 0.06, 0.05]} radius={0.02} smoothness={2} position={[-0.28, 0, 0.03]}>
          {trim}
        </RoundedBox>
        <Led position={[0.36, 0, 0.02]} glow={glow} />
        <Led position={[0.52, 0, 0.02]} glow={glow} />
      </group>
    ))}
  </>
);

const TRAY_HEIGHT = 0.12;
const MESSAGE_XS = [-0.72, -0.24, 0.24, 0.72];

/** Messages waiting in line on a tray. The lighter one is next out. */
const Queue = ({ body, trim }: ShapeProps) => (
  <>
    <RoundedBox args={[NODE_WIDTH, TRAY_HEIGHT, 1.5]} radius={0.05} smoothness={3} position={[0, FLOOR + TRAY_HEIGHT / 2, 0]}>
      {trim}
    </RoundedBox>
    {MESSAGE_XS.map((x, index) => (
      <RoundedBox key={x} args={[0.3, 0.96, 1.2]} radius={0.07} smoothness={3} position={[x, FLOOR + TRAY_HEIGHT + 0.48, 0]}>
        {index === MESSAGE_XS.length - 1 ? trim : body}
      </RoundedBox>
    ))}
  </>
);

const STAND_BASE = disk(0.5, 0.08, 0.03);
const SCREEN_LINES: [x: number, y: number, width: number][] = [
  [-0.3, 0.2, 0.9],
  [-0.15, 0.04, 1.2],
  [-0.45, -0.12, 0.6],
];

/** A monitor on a stand. */
const Client = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <group position={[0, 0.12, 0]} rotation={[-0.14, 0, 0]}>
      <RoundedBox args={[1.9, 0.96, 0.12]} radius={0.05} smoothness={4}>
        {body}
      </RoundedBox>
      <RoundedBox args={[1.74, 0.8, 0.02]} radius={0.01} smoothness={2} position={[0, 0, 0.06]}>
        {inset}
      </RoundedBox>
      {SCREEN_LINES.map(([x, y, width]) => (
        <mesh key={y} position={[x, y, 0.075]}>
          <boxGeometry args={[width, 0.06, 0.01]} />
          {glow}
        </mesh>
      ))}
    </group>
    <mesh position={[0, -0.44, -0.05]}>
      <cylinderGeometry args={[0.08, 0.08, 0.26, 16]} />
      {trim}
    </mesh>
    <mesh geometry={STAND_BASE} position={[0, FLOOR + 0.04, -0.05]}>
      {trim}
    </mesh>
  </>
);

const SHOULDERS_HEIGHT = 0.56;

/** A person: head and shoulders. */
const User = ({ body }: ShapeProps) => (
  <>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.29, 32, 32]} />
      {body}
    </mesh>
    <mesh position={[0, FLOOR, 0]} scale={[1, SHOULDERS_HEIGHT / 0.62, 0.72]}>
      <sphereGeometry args={[0.62, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      {body}
    </mesh>
  </>
);

const CLOUD_PUFFS: [x: number, y: number, z: number, radius: number][] = [
  [0.26, 0.14, 0, 0.44],
  [-0.34, 0.04, 0, 0.36],
  [-0.02, -0.02, 0.22, 0.34],
];

/** Something outside your system: the internet, a third party. */
const Cloud = ({ body }: ShapeProps) => (
  <>
    <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.34, 1.1, 12, 32]} />
      {body}
    </mesh>
    {CLOUD_PUFFS.map(([x, y, z, radius]) => (
      <mesh key={x} position={[x, y, z]}>
        <sphereGeometry args={[radius, 32, 32]} />
        {body}
      </mesh>
    ))}
  </>
);

const BUCKET_TOP = 0.74;
const BUCKET_BOTTOM = 0.54;
const BUCKET = turned([[0, FLOOR], ...arc([BUCKET_BOTTOM - 0.08, FLOOR + 0.08], 0.08, -90, 0), [BUCKET_TOP, TOP - 0.1], [0, TOP - 0.1]]);
const BUCKET_RIM = disk(BUCKET_TOP + 0.06, 0.12, 0.04);

/** A bucket for files and blobs. */
const Storage = ({ body, trim, inset }: ShapeProps) => (
  <>
    <mesh geometry={BUCKET}>{body}</mesh>
    <mesh geometry={BUCKET_RIM} position={[0, TOP - 0.06, 0]}>
      {trim}
    </mesh>
    <mesh position={[0, TOP + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[BUCKET_TOP - 0.06, 48]} />
      {inset}
    </mesh>
  </>
);

const CODE_LINES: [indent: number, y: number, width: number][] = [
  [0, 0.38, 0.5],
  [0.1, 0.24, 0.46],
  [0.1, 0.1, 0.34],
  [0, -0.04, 0.28],
  [0.1, -0.18, 0.5],
  [0, -0.32, 0.18],
];
const PAGE_LEFT = -0.34;

/** A source file: any class or module that has no better shape. */
const File = ({ body, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <RoundedBox args={[1, NODE_HEIGHT, 0.16]} radius={0.05} smoothness={4}>
      {body}
    </RoundedBox>
    <RoundedBox args={[0.84, 1.04, 0.02]} radius={0.01} smoothness={2} position={[0, 0, 0.08]}>
      {inset}
    </RoundedBox>
    {CODE_LINES.map(([indent, y, width]) => (
      <mesh key={y} position={[PAGE_LEFT + indent + width / 2, y, 0.095]}>
        <boxGeometry args={[width, 0.05, 0.01]} />
        {glow}
      </mesh>
    ))}
  </group>
);

const DECK_SLOPE = 0.5;
const DECK_THICKNESS = 0.2;
const BUTTON_XS = [-0.6, -0.3, 0];

/** A control desk: buttons and a slider. Takes a request and decides what to call. */
const Controller = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <RoundedBox args={[1.8, 0.45, 1.5]} radius={0.08} smoothness={4} position={[0, FLOOR + 0.225, 0]}>
      {body}
    </RoundedBox>
    <group position={[0, 0.06, -0.05]} rotation={[DECK_SLOPE, 0, 0]}>
      <RoundedBox args={[1.8, DECK_THICKNESS, 1.3]} radius={0.06} smoothness={4}>
        {body}
      </RoundedBox>
      <RoundedBox args={[1.56, 0.02, 1.06]} radius={0.01} smoothness={2} position={[0, DECK_THICKNESS / 2, 0]}>
        {inset}
      </RoundedBox>
      {BUTTON_XS.map((x) => (
        <mesh key={x} position={[x, DECK_THICKNESS / 2 + 0.04, 0.22]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
          {glow}
        </mesh>
      ))}
      {BUTTON_XS.map((x) => (
        <mesh key={x} position={[x, DECK_THICKNESS / 2 + 0.04, -0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.06, 24]} />
          {trim}
        </mesh>
      ))}
      <mesh position={[0.52, DECK_THICKNESS / 2 + 0.02, 0]}>
        <boxGeometry args={[0.07, 0.02, 0.8]} />
        {trim}
      </mesh>
      <RoundedBox args={[0.24, 0.1, 0.16]} radius={0.03} smoothness={2} position={[0.52, DECK_THICKNESS / 2 + 0.06, -0.12]}>
        {trim}
      </RoundedBox>
    </group>
  </>
);

const POST_BASE = disk(0.42, 0.1, 0.04);
const SIGNS: [y: number, direction: 1 | -1, z: number][] = [
  [0.36, 1, 0],
  [-0.06, -1, 0.16],
];

/** A signpost: one way in, several ways out. */
const Router = ({ body, trim }: ShapeProps) => (
  <>
    <mesh>
      <cylinderGeometry args={[0.09, 0.09, NODE_HEIGHT, 16]} />
      {trim}
    </mesh>
    <mesh geometry={POST_BASE} position={[0, FLOOR + 0.04, 0]}>
      {trim}
    </mesh>
    {SIGNS.map(([y, direction, z]) => (
      <group key={y} position={[0, y, z]} scale={[direction, 1, 1]}>
        <RoundedBox args={[1.05, 0.36, 0.16]} radius={0.04} smoothness={3} position={[0.22, 0, 0]}>
          {body}
        </RoundedBox>
        <mesh position={[0.745, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.255, 0.255, 0.16]} />
          {body}
        </mesh>
      </group>
    ))}
  </>
);

const TEETH = 8;

/** A gear: something that runs in the background, a job or a consumer. */
const Worker = ({ body, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.44, 0.44, 0.3, 48]} />
      {body}
    </mesh>
    {Array.from({ length: TEETH }, (_, tooth) => {
      const angle = (tooth / TEETH) * Math.PI * 2;
      return (
        <RoundedBox
          key={tooth}
          args={[0.22, 0.22, 0.3]}
          radius={0.04}
          smoothness={2}
          position={[Math.cos(angle) * 0.49, Math.sin(angle) * 0.49, 0]}
          rotation={[0, 0, angle]}
        >
          {body}
        </RoundedBox>
      );
    })}
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.18, 0.18, 0.32, 32]} />
      {inset}
    </mesh>
    <Led position={[0, 0, 0.16]} glow={glow} />
  </group>
);

const CLOCK_RADIUS = 0.58;
const HOURS = [0, 1, 2, 3];

/** A clock: something that fires on a schedule. */
const Clock = ({ body, trim, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[CLOCK_RADIUS, CLOCK_RADIUS, 0.24, 64]} />
      {body}
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.115]}>
      <cylinderGeometry args={[CLOCK_RADIUS - 0.09, CLOCK_RADIUS - 0.09, 0.02, 64]} />
      {inset}
    </mesh>
    {HOURS.map((hour) => {
      const angle = (hour / HOURS.length) * Math.PI * 2;
      return (
        <mesh key={hour} position={[Math.cos(angle) * 0.39, Math.sin(angle) * 0.39, 0.13]} rotation={[0, 0, angle]}>
          <boxGeometry args={[0.1, 0.035, 0.01]} />
          {trim}
        </mesh>
      );
    })}
    <mesh position={[0, 0.17, 0.135]}>
      <boxGeometry args={[0.05, 0.34, 0.012]} />
      {glow}
    </mesh>
    <mesh position={[0.11, 0, 0.135]}>
      <boxGeometry args={[0.22, 0.05, 0.012]} />
      {glow}
    </mesh>
    <Led position={[0, 0, 0.13]} glow={glow} />
  </group>
);

const shieldOutline = (halfWidth: number, top: number, shoulder: number, tip: number) => {
  const outline = new Shape();
  outline.moveTo(-halfWidth, top);
  outline.lineTo(halfWidth, top);
  outline.lineTo(halfWidth, shoulder);
  outline.quadraticCurveTo(halfWidth, tip * 0.45, 0, tip);
  outline.quadraticCurveTo(-halfWidth, tip * 0.45, -halfWidth, shoulder);
  outline.closePath();
  return outline;
};
const SHIELD_DEPTH = 0.28;
const SHIELD = new ExtrudeGeometry(shieldOutline(0.5, 0.54, 0.05, -0.54), {
  depth: SHIELD_DEPTH,
  bevelEnabled: true,
  bevelSize: 0.05,
  bevelThickness: 0.05,
  bevelSegments: 4,
  curveSegments: 24,
}).translate(0, 0, -SHIELD_DEPTH / 2);
const SHIELD_FACE = new ExtrudeGeometry(shieldOutline(0.36, 0.4, 0.06, -0.36), { depth: 0.02, bevelEnabled: false, curveSegments: 24 });

/** A shield: a check every request has to pass. A policy, a guard, a middleware. */
const Shield = ({ body, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <mesh geometry={SHIELD}>{body}</mesh>
    <mesh geometry={SHIELD_FACE} position={[0, 0, SHIELD_DEPTH / 2 + 0.045]}>
      {inset}
    </mesh>
    <mesh position={[0, 0.1, SHIELD_DEPTH / 2 + 0.07]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.02, 24]} />
      {glow}
    </mesh>
    <mesh position={[0, -0.07, SHIELD_DEPTH / 2 + 0.075]}>
      <boxGeometry args={[0.07, 0.22, 0.012]} />
      {glow}
    </mesh>
  </group>
);

const outlineOf = (points: [x: number, y: number][]) => {
  const outline = new Shape();
  points.forEach(([x, y], index) => (index === 0 ? outline.moveTo(x, y) : outline.lineTo(x, y)));
  outline.closePath();
  return outline;
};

const BOLT_POINTS: [number, number][] = [
  [0.2, 0.54],
  [-0.36, -0.08],
  [-0.02, -0.08],
  [-0.2, -0.54],
  [0.36, 0.08],
  [0.02, 0.08],
];
const BOLT_DEPTH = 0.24;
const BOLT = new ExtrudeGeometry(outlineOf(BOLT_POINTS), {
  depth: BOLT_DEPTH,
  bevelEnabled: true,
  bevelSize: 0.04,
  bevelThickness: 0.04,
  bevelSegments: 3,
}).translate(0, 0, -BOLT_DEPTH / 2);
const BOLT_FACE = new ExtrudeGeometry(outlineOf(BOLT_POINTS.map(([x, y]) => [x * 0.55, y * 0.55])), { depth: 0.02, bevelEnabled: false });

/** A lightning bolt: code that runs because something else happened. A database trigger, a webhook, an event handler. */
const Trigger = ({ body, trim, glow }: ShapeProps) => (
  <>
    <mesh geometry={POST_BASE} position={[0, FLOOR + 0.04, 0]}>
      {trim}
    </mesh>
    <group rotation={[-0.12, 0, 0]}>
      <mesh geometry={BOLT}>{body}</mesh>
      <mesh geometry={BOLT_FACE} position={[0, 0, BOLT_DEPTH / 2 + 0.045]}>
        {glow}
      </mesh>
    </group>
  </>
);

const HEAD_DEPTH = 0.9;

/** A robot head: something that acts on its own. An automation, a bot, an AI assistant. */
const Agent = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <mesh position={[0, FLOOR + 0.125, 0]}>
      <cylinderGeometry args={[0.24, 0.3, 0.25, 32]} />
      {trim}
    </mesh>
    <RoundedBox args={[1.2, 0.8, HEAD_DEPTH]} radius={0.14} smoothness={4} position={[0, 0.05, 0]}>
      {body}
    </RoundedBox>
    {[-1, 1].map((side) => (
      <RoundedBox key={side} args={[0.1, 0.32, 0.32]} radius={0.04} smoothness={2} position={[side * 0.63, 0.05, 0]}>
        {trim}
      </RoundedBox>
    ))}
    <RoundedBox args={[0.92, 0.36, 0.04]} radius={0.02} smoothness={2} position={[0, 0.1, HEAD_DEPTH / 2]}>
      {inset}
    </RoundedBox>
    {[-0.22, 0.22].map((x) => (
      <mesh key={x} position={[x, 0.1, HEAD_DEPTH / 2 + 0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 24]} />
        {glow}
      </mesh>
    ))}
    <mesh position={[0, 0.49, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.1, 12]} />
      {trim}
    </mesh>
    <Led position={[0, 0.55, 0]} glow={glow} />
  </>
);

const CHIP = 0.96;
const PINS = [-0.28, 0, 0.28];
const SPARK = new ExtrudeGeometry(
  outlineOf(
    Array.from({ length: 8 }, (_, point) => {
      const radius = point % 2 === 0 ? 0.27 : 0.08;
      const angle = (point / 8) * Math.PI * 2 + Math.PI / 2;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }),
  ),
  { depth: 0.02, bevelEnabled: false },
);

/** A chip with a spark on it: the model itself, apart from the agent that calls it. */
const Model = ({ body, trim, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <RoundedBox args={[CHIP, CHIP, 0.2]} radius={0.06} smoothness={4}>
      {body}
    </RoundedBox>
    {PINS.flatMap((offset) =>
      [-1, 1].flatMap((side) => [
        <mesh key={`x${offset}${side}`} position={[side * (CHIP / 2 + 0.05), offset, 0]}>
          <boxGeometry args={[0.12, 0.09, 0.1]} />
          {trim}
        </mesh>,
        <mesh key={`y${offset}${side}`} position={[offset, side * (CHIP / 2 + 0.05), 0]}>
          <boxGeometry args={[0.09, 0.12, 0.1]} />
          {trim}
        </mesh>,
      ]),
    )}
    <RoundedBox args={[0.74, 0.74, 0.02]} radius={0.01} smoothness={2} position={[0, 0, 0.1]}>
      {inset}
    </RoundedBox>
    <mesh geometry={SPARK} position={[0, 0, 0.11]}>
      {glow}
    </mesh>
  </group>
);

const TOWER_DEPTH = 1;
const TOWER_X = -0.25;
const WINDOW_COLUMNS = [-0.36, 0, 0.36];
const WINDOW_ROWS = [0.34, 0.02, -0.3];

/** An office block: a system someone else runs. A partner's API, a payment provider, a regulator. */
const External = ({ body, inset, glow }: ShapeProps) => (
  <>
    <RoundedBox args={[1.2, NODE_HEIGHT, TOWER_DEPTH]} radius={0.05} smoothness={3} position={[TOWER_X, 0, 0]}>
      {body}
    </RoundedBox>
    <RoundedBox args={[0.62, 0.7, 0.8]} radius={0.05} smoothness={3} position={[0.64, FLOOR + 0.35, 0]}>
      {body}
    </RoundedBox>
    {WINDOW_ROWS.flatMap((y, row) =>
      WINDOW_COLUMNS.map((x, column) => (
        <mesh key={`${x}${y}`} position={[TOWER_X + x, y, TOWER_DEPTH / 2 + 0.006]}>
          <boxGeometry args={[0.22, 0.2, 0.012]} />
          {row === 1 && column === 1 ? glow : inset}
        </mesh>
      )),
    )}
    {[-0.12, -0.42].map((y) => (
      <mesh key={y} position={[0.64, y, 0.406]}>
        <boxGeometry args={[0.3, 0.16, 0.012]} />
        {inset}
      </mesh>
    ))}
  </>
);

const PHONE_CARDS = [0.12, -0.1, -0.32];

/** A phone: a mobile app, a device that goes offline. */
const Phone = ({ body, trim, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <RoundedBox args={[0.66, NODE_HEIGHT, 0.1]} radius={0.05} smoothness={4}>
      {body}
    </RoundedBox>
    <RoundedBox args={[0.56, 1.08, 0.02]} radius={0.01} smoothness={2} position={[0, 0, 0.05]}>
      {inset}
    </RoundedBox>
    <mesh position={[0, 0.36, 0.065]}>
      <boxGeometry args={[0.44, 0.16, 0.01]} />
      {glow}
    </mesh>
    {PHONE_CARDS.map((y) => (
      <mesh key={y} position={[0, y, 0.065]}>
        <boxGeometry args={[0.44, 0.14, 0.01]} />
        {trim}
      </mesh>
    ))}
    <mesh position={[0, -0.47, 0.065]}>
      <boxGeometry args={[0.2, 0.03, 0.01]} />
      {trim}
    </mesh>
  </group>
);

const ENVELOPE: [width: number, height: number] = [1.5, 0.98];
const FLAP_ANGLE = Math.atan2(ENVELOPE[1] / 2, ENVELOPE[0] / 2 - 0.03);
const FLAP_LENGTH = Math.hypot(ENVELOPE[0] / 2 - 0.03, ENVELOPE[1] / 2);

/** An envelope with an unread dot: a message leaving the system. An email, an alert, a push. */
const Notification = ({ body, inset, glow }: ShapeProps) => (
  <group position={[0, FLOOR + ENVELOPE[1] / 2, 0]} rotation={[-0.12, 0, 0]}>
    <RoundedBox args={[ENVELOPE[0], ENVELOPE[1], 0.14]} radius={0.05} smoothness={4}>
      {body}
    </RoundedBox>
    {[-1, 1].map((side) => (
      <mesh key={side} position={[side * (ENVELOPE[0] / 4 - 0.015), ENVELOPE[1] / 4, 0.075]} rotation={[0, 0, -side * FLAP_ANGLE]}>
        <boxGeometry args={[FLAP_LENGTH, 0.035, 0.012]} />
        {inset}
      </mesh>
    ))}
    <mesh position={[ENVELOPE[0] / 2 - 0.1, ENVELOPE[1] / 2 - 0.08, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.17, 0.17, 0.06, 32]} />
      {glow}
    </mesh>
  </group>
);

const BOW_Y = 0.28;

/** A key: a credential. A token, a key pair, a signature. */
const Key = ({ body, trim, glow }: ShapeProps) => (
  <>
    <mesh geometry={POST_BASE} position={[0, FLOOR + 0.04, 0]}>
      {trim}
    </mesh>
    <group rotation={[-0.12, 0, 0]}>
      <mesh position={[0, BOW_Y, 0]}>
        <torusGeometry args={[0.23, 0.08, 16, 48]} />
        {body}
      </mesh>
      <RoundedBox args={[0.15, 0.68, 0.15]} radius={0.04} smoothness={3} position={[0, FLOOR + 0.34, 0]}>
        {body}
      </RoundedBox>
      {[-0.46, -0.26].map((y, tooth) => (
        <RoundedBox key={y} args={[0.26 - 0.07 * tooth, 0.11, 0.15]} radius={0.03} smoothness={2} position={[0.075 + (0.26 - 0.07 * tooth) / 2, y, 0]}>
          {body}
        </RoundedBox>
      ))}
      <mesh position={[0, FLOOR + 0.36, 0.08]}>
        <boxGeometry args={[0.04, 0.46, 0.01]} />
        {glow}
      </mesh>
    </group>
  </>
);

const ENTRIES: [y: number, width: number][] = [
  [0.22, 0.6],
  [0.06, 0.44],
  [-0.1, 0.66],
  [-0.26, 0.38],
];
const TAPE_LEFT = -0.36;

/** A printed tape: a record that only grows. History, a ledger, an audit trail. The newest line is lit. */
const Log = ({ body, trim, inset, glow }: ShapeProps) => (
  <group rotation={[-0.12, 0, 0]}>
    <mesh position={[0, TOP - 0.14, -0.02]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.14, 0.14, 1.06, 32]} />
      {trim}
    </mesh>
    <RoundedBox args={[0.92, 1.04, 0.08]} radius={0.03} smoothness={3} position={[0, FLOOR + 0.52, 0]}>
      {body}
    </RoundedBox>
    {ENTRIES.map(([y, width]) => (
      <mesh key={y} position={[TAPE_LEFT + width / 2, y, 0.045]}>
        <boxGeometry args={[width, 0.05, 0.01]} />
        {inset}
      </mesh>
    ))}
    <mesh position={[TAPE_LEFT + 0.26, -0.42, 0.045]}>
      <boxGeometry args={[0.52, 0.06, 0.01]} />
      {glow}
    </mesh>
  </group>
);

/** Every shape fits the node's 2 x 1.2 x 2 box and stands on its floor. */
export const shapes: Record<NodeShape, (props: ShapeProps) => ReactNode> = {
  service: Service,
  database: Database,
  server: Server,
  queue: Queue,
  client: Client,
  user: User,
  cloud: Cloud,
  storage: Storage,
  file: File,
  controller: Controller,
  router: Router,
  worker: Worker,
  clock: Clock,
  shield: Shield,
  trigger: Trigger,
  agent: Agent,
  model: Model,
  external: External,
  phone: Phone,
  notification: Notification,
  key: Key,
  log: Log,
};
