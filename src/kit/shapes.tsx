import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
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
  /** Lighter parts that give the silhouette its detail: bands, slots, rims. */
  trim: ReactNode;
  /** Small parts that are always lit: LEDs, screens. */
  glow: ReactNode;
};

const FLOOR = -NODE_HEIGHT / 2;

const Service = ({ body }: ShapeProps) => (
  <RoundedBox args={[NODE_WIDTH, NODE_HEIGHT, NODE_WIDTH]} radius={0.16} smoothness={4}>
    {body}
  </RoundedBox>
);

/** Three stacked disks. */
const Database = ({ body, trim }: ShapeProps) => (
  <>
    <mesh>
      <cylinderGeometry args={[0.8, 0.8, NODE_HEIGHT - 0.12, 48]} />
      {trim}
    </mesh>
    {[-0.41, 0, 0.41].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.34, 48]} />
        {body}
      </mesh>
    ))}
  </>
);

/** A rack: three drive bays on the front, each with a status light. */
const Server = ({ body, trim, glow }: ShapeProps) => (
  <>
    <RoundedBox args={[1.6, NODE_HEIGHT, 1.7]} radius={0.08} smoothness={4}>
      {body}
    </RoundedBox>
    {[-0.36, 0, 0.36].map((y) => (
      <group key={y} position={[0, y, 0.86]}>
        <mesh>
          <boxGeometry args={[1.3, 0.24, 0.04]} />
          {trim}
        </mesh>
        <mesh position={[0.48, 0, 0.03]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          {glow}
        </mesh>
      </group>
    ))}
  </>
);

/** Messages waiting in line on a tray. */
const Queue = ({ body, trim }: ShapeProps) => (
  <>
    <mesh position={[0, FLOOR + 0.06, 0]}>
      <boxGeometry args={[NODE_WIDTH, 0.12, 1.5]} />
      {trim}
    </mesh>
    {[-0.72, -0.24, 0.24, 0.72].map((x) => (
      <RoundedBox key={x} args={[0.34, 0.98, 1.2]} radius={0.06} smoothness={3} position={[x, FLOOR + 0.12 + 0.49, 0]}>
        {body}
      </RoundedBox>
    ))}
  </>
);

/** A monitor on a stand. */
const Client = ({ body, trim, glow }: ShapeProps) => (
  <>
    <RoundedBox args={[1.9, 0.98, 0.14]} radius={0.06} smoothness={4} position={[0, 0.11, 0]}>
      {body}
    </RoundedBox>
    <mesh position={[0, 0.11, 0.075]}>
      <planeGeometry args={[1.7, 0.78]} />
      {glow}
    </mesh>
    <mesh position={[0, -0.46, 0]}>
      <cylinderGeometry args={[0.09, 0.09, 0.2, 16]} />
      {trim}
    </mesh>
    <mesh position={[0, FLOOR + 0.04, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.08, 32]} />
      {trim}
    </mesh>
  </>
);

/** A person: head and shoulders. */
const User = ({ body }: ShapeProps) => (
  <>
    <mesh position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      {body}
    </mesh>
    <mesh position={[0, -0.3, 0]}>
      <cylinderGeometry args={[0.26, 0.55, 0.6, 32]} />
      {body}
    </mesh>
  </>
);

const CLOUD_PUFFS: [x: number, y: number, z: number, radius: number][] = [
  [0, 0, 0, 0.6],
  [-0.55, -0.15, 0, 0.45],
  [0.55, -0.15, 0, 0.45],
  [-0.1, -0.2, 0.35, 0.4],
  [0.2, -0.2, -0.3, 0.4],
];

/** Something outside your system: the internet, a third party. */
const Cloud = ({ body }: ShapeProps) => (
  <>
    {CLOUD_PUFFS.map(([x, y, z, radius]) => (
      <mesh key={`${x},${z}`} position={[x, y, z]}>
        <sphereGeometry args={[radius, 32, 32]} />
        {body}
      </mesh>
    ))}
  </>
);

/** A bucket for files and blobs. */
const Storage = ({ body, trim }: ShapeProps) => (
  <>
    <mesh position={[0, -0.04, 0]}>
      <cylinderGeometry args={[0.85, 0.6, NODE_HEIGHT - 0.08, 48]} />
      {body}
    </mesh>
    <mesh position={[0, NODE_HEIGHT / 2 - 0.05, 0]}>
      <cylinderGeometry args={[0.9, 0.9, 0.1, 48]} />
      {trim}
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
