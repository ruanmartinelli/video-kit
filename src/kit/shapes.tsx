import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import { LatheGeometry, Vector2 } from "three";
import { z } from "zod";
import { NODE_HEIGHT, NODE_WIDTH } from "./geometry";

export const nodeShapeSchema = z.enum(["service", "database", "server", "queue", "client", "user", "cloud", "storage"]);

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
const turned = (profile: Profile) => new LatheGeometry(profile.map(([radius, y]) => new Vector2(radius, y)), 64);

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
const BUCKET = turned([
  [0, FLOOR],
  ...arc([BUCKET_BOTTOM - 0.08, FLOOR + 0.08], 0.08, -90, 0),
  [BUCKET_TOP, TOP - 0.1],
  [0, TOP - 0.1],
]);
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
};
