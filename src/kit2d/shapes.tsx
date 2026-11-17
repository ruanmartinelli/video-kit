import type { ReactNode } from "react";
import type { NodeShape } from "../kit/shapeNames";

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

/** A status light set in a dark ring, so it reads on a lit body too. */
const Led = ({ x, y, r = 0.075, inset, glow }: { x: number; y: number; r?: number; inset: string; glow: string }) => (
  <>
    <circle cx={x} cy={y} r={r + 0.045} fill={inset} />
    <circle cx={x} cy={y} r={r} fill={glow} />
  </>
);

/** A plain box with one status light. */
const Service = ({ body, glow }: ShapeProps) => (
  <>
    <rect x={-0.9} y={-0.55} width={1.8} height={1.1} rx={0.16} fill={body} />
    <circle cx={0.62} cy={-0.28} r={0.07} fill={glow} />
  </>
);

const DB_RX = 0.7;
const DB_RY = 0.15;
const PLATTER_HEIGHT = 0.28;
const PLATTER_YS = [-0.47, -0.13, 0.21];
const platterPath = (y: number) =>
  `M ${-DB_RX} ${y} A ${DB_RX} ${DB_RY} 0 0 0 ${DB_RX} ${y} L ${DB_RX} ${y + PLATTER_HEIGHT} A ${DB_RX} ${DB_RY} 0 0 1 ${-DB_RX} ${y + PLATTER_HEIGHT} Z`;

/** Three stacked platters. */
const Database = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.6} y={PLATTER_YS[0]} width={1.2} height={0.96} fill={trim} />
    {PLATTER_YS.map((y) => (
      <g key={y}>
        <path d={platterPath(y)} fill={body} />
        <Led x={0.44} y={y + PLATTER_HEIGHT / 2 + 0.12} inset={inset} glow={glow} />
      </g>
    ))}
    <ellipse cx={0} cy={PLATTER_YS[0]} rx={DB_RX} ry={DB_RY} fill={trim} />
  </>
);

/** A rack: three drive bays on the front, each with a handle and status lights. */
const Server = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.76} y={-0.64} width={1.52} height={1.28} rx={0.12} fill={body} />
    {[-0.38, 0, 0.38].map((y) => (
      <g key={y}>
        <rect x={-0.62} y={y - 0.14} width={1.24} height={0.28} rx={0.05} fill={inset} />
        <rect x={-0.5} y={y - 0.035} width={0.5} height={0.07} rx={0.035} fill={trim} />
        <circle cx={0.28} cy={y} r={0.055} fill={glow} />
        <circle cx={0.46} cy={y} r={0.055} fill={glow} />
      </g>
    ))}
  </>
);

const MESSAGE_XS = [-0.72, -0.24, 0.24, 0.72];

/** Messages waiting in line on a tray. The lighter one is next out. */
const Queue = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.95} y={0.5} width={1.9} height={0.14} rx={0.06} fill={trim} />
    {MESSAGE_XS.map((x, index) => {
      const next = index === MESSAGE_XS.length - 1;
      return (
        <g key={x}>
          <rect x={x - 0.17} y={-0.6} width={0.34} height={1.08} rx={0.09} fill={next ? trim : body} />
          <rect x={x - 0.05} y={-0.44} width={0.1} height={0.36} rx={0.05} fill={next ? glow : inset} />
        </g>
      );
    })}
  </>
);

const SCREEN_LINES: [x: number, y: number, width: number][] = [
  [-0.7, -0.38, 0.9],
  [-0.56, -0.2, 1.2],
  [-0.7, -0.02, 0.6],
];

/** A monitor on a stand. */
const Client = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.1} y={0.3} width={0.2} height={0.26} fill={trim} />
    <rect x={-0.42} y={0.52} width={0.84} height={0.12} rx={0.06} fill={trim} />
    <rect x={-0.95} y={-0.64} width={1.9} height={0.98} rx={0.1} fill={body} />
    <rect x={-0.85} y={-0.54} width={1.7} height={0.78} rx={0.05} fill={inset} />
    {SCREEN_LINES.map(([x, y, width]) => (
      <rect key={y} x={x} y={y - 0.035} width={width} height={0.07} rx={0.035} fill={glow} />
    ))}
  </>
);

/** A person: head and shoulders. */
const User = ({ body, inset, glow }: ShapeProps) => (
  <>
    <circle cx={0} cy={-0.32} r={0.3} fill={body} />
    <path d="M -0.66 0.64 A 0.66 0.56 0 0 1 0.66 0.64 Z" fill={body} />
    <Led x={0.3} y={0.36} r={0.1} inset={inset} glow={glow} />
  </>
);

/** Something outside your system: the internet, a third party. */
const Cloud = ({ body, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.9} y={-0.04} width={1.8} height={0.6} rx={0.3} fill={body} />
    <circle cx={-0.34} cy={-0.06} r={0.36} fill={body} />
    <circle cx={0.24} cy={-0.16} r={0.44} fill={body} />
    <Led x={0.58} y={0.28} inset={inset} glow={glow} />
  </>
);

/** A bucket for files and blobs. */
const Storage = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <path d="M -0.72 -0.44 L 0.72 -0.44 L 0.56 0.54 Q 0.54 0.64 0.44 0.64 L -0.44 0.64 Q -0.54 0.64 -0.56 0.54 Z" fill={body} />
    <ellipse cx={0} cy={-0.44} rx={0.82} ry={0.2} fill={trim} />
    <ellipse cx={0} cy={-0.44} rx={0.68} ry={0.13} fill={inset} />
    <rect x={-0.66} y={0.0} width={1.32} height={0.07} fill={trim} />
    <Led x={0} y={0.32} inset={inset} glow={glow} />
  </>
);

const CODE_LINES: [indent: number, y: number, width: number][] = [
  [0, -0.38, 0.4],
  [0.12, -0.22, 0.48],
  [0.12, -0.06, 0.34],
  [0.24, 0.1, 0.36],
  [0.12, 0.26, 0.42],
  [0, 0.42, 0.22],
];
const PAGE_LEFT = -0.36;

/** A source file: any class or module that has no better shape. */
const File = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <path
      d="M -0.52 -0.58 Q -0.52 -0.64 -0.46 -0.64 L 0.24 -0.64 L 0.52 -0.36 L 0.52 0.58 Q 0.52 0.64 0.46 0.64 L -0.46 0.64 Q -0.52 0.64 -0.52 0.58 Z"
      fill={body}
    />
    <path d="M -0.44 -0.56 L 0.2 -0.56 L 0.44 -0.32 L 0.44 0.56 L -0.44 0.56 Z" fill={inset} />
    <path d="M 0.24 -0.64 L 0.24 -0.36 L 0.52 -0.36 Z" fill={trim} />
    {CODE_LINES.map(([indent, y, width]) => (
      <rect key={y} x={PAGE_LEFT + indent} y={y - 0.03} width={width} height={0.06} rx={0.03} fill={glow} />
    ))}
  </>
);

/** A control desk: buttons and a slider. Takes a request and decides what to call. */
const Controller = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.92} y={0.22} width={1.84} height={0.42} rx={0.08} fill={body} />
    <rect x={-0.7} y={0.38} width={1.4} height={0.1} rx={0.05} fill={inset} />
    <path d="M -0.72 -0.62 L 0.72 -0.62 L 0.9 0.16 L -0.9 0.16 Z" fill={body} stroke={body} strokeWidth={0.08} strokeLinejoin="round" />
    <path d="M -0.64 -0.52 L 0.64 -0.52 L 0.78 0.06 L -0.78 0.06 Z" fill={inset} />
    {[-0.48, -0.2, 0.08].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-0.32} r={0.1} fill={trim} />
        <circle cx={x - 0.03} cy={-0.08} r={0.1} fill={glow} />
      </g>
    ))}
    <rect x={0.46} y={-0.44} width={0.07} height={0.44} rx={0.035} fill={trim} />
    <rect x={0.37} y={-0.3} width={0.25} height={0.12} rx={0.04} fill={trim} />
  </>
);

/** A signpost: one way in, several ways out. */
const Router = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.07} y={-0.66} width={0.14} height={1.26} rx={0.04} fill={trim} />
    <rect x={-0.4} y={0.54} width={0.8} height={0.12} rx={0.06} fill={trim} />
    <path d="M -0.42 -0.58 L 0.68 -0.58 L 0.92 -0.38 L 0.68 -0.18 L -0.42 -0.18 Z" fill={body} stroke={body} strokeWidth={0.08} strokeLinejoin="round" />
    <path d="M 0.42 -0.06 L -0.68 -0.06 L -0.92 0.14 L -0.68 0.34 L 0.42 0.34 Z" fill={body} stroke={body} strokeWidth={0.08} strokeLinejoin="round" />
    <rect x={-0.3} y={-0.46} width={0.86} height={0.16} rx={0.05} fill={inset} />
    <rect x={-0.22} y={-0.415} width={0.5} height={0.07} rx={0.035} fill={glow} />
    <rect x={-0.56} y={0.06} width={0.86} height={0.16} rx={0.05} fill={inset} />
    <rect x={-0.28} y={0.105} width={0.5} height={0.07} rx={0.035} fill={glow} />
  </>
);

const TEETH = 8;

/** A gear: something that runs in the background, a job or a consumer. */
const Worker = ({ body, inset, glow }: ShapeProps) => (
  <>
    {Array.from({ length: TEETH }, (_, tooth) => (
      <rect key={tooth} x={0.36} y={-0.14} width={0.28} height={0.28} rx={0.05} fill={body} transform={`rotate(${(tooth * 360) / TEETH})`} />
    ))}
    <circle cx={0} cy={0} r={0.48} fill={body} />
    <circle cx={0} cy={0} r={0.2} fill={inset} />
    <circle cx={0} cy={0} r={0.09} fill={glow} />
  </>
);

/** A clock: something that fires on a schedule. */
const Clock = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <circle cx={0} cy={0} r={0.64} fill={body} />
    <circle cx={0} cy={0} r={0.52} fill={inset} />
    {[0, 90, 180, 270].map((angle) => (
      <rect key={angle} x={0.34} y={-0.025} width={0.12} height={0.05} fill={trim} transform={`rotate(${angle})`} />
    ))}
    <rect x={-0.03} y={-0.38} width={0.06} height={0.38} rx={0.03} fill={glow} />
    <rect x={0} y={-0.03} width={0.26} height={0.06} rx={0.03} fill={glow} />
    <circle cx={0} cy={0} r={0.07} fill={glow} />
  </>
);

const shieldPath = (halfWidth: number, top: number, shoulder: number, tip: number) => {
  const control = shoulder + (tip - shoulder) * 0.55;
  return `M ${-halfWidth} ${top} L ${halfWidth} ${top} L ${halfWidth} ${shoulder} Q ${halfWidth} ${control} 0 ${tip} Q ${-halfWidth} ${control} ${-halfWidth} ${shoulder} Z`;
};

/** A shield: a check every request has to pass. A policy, a guard, a middleware. */
const Shield = ({ body, inset, glow }: ShapeProps) => (
  <>
    <path d={shieldPath(0.54, -0.6, -0.02, 0.62)} fill={body} stroke={body} strokeWidth={0.08} strokeLinejoin="round" />
    <path d={shieldPath(0.4, -0.47, -0.02, 0.44)} fill={inset} />
    <circle cx={0} cy={-0.12} r={0.11} fill={glow} />
    <path d="M -0.04 -0.08 L 0.04 -0.08 L 0.07 0.18 L -0.07 0.18 Z" fill={glow} />
  </>
);

const BOLT: [number, number][] = [
  [0.2, -0.54],
  [-0.36, 0.08],
  [-0.02, 0.08],
  [-0.2, 0.54],
  [0.36, -0.08],
  [0.02, -0.08],
];
const boltPath = (scale: number) => `M ${BOLT.map(([x, y]) => `${x * scale * 1.15} ${y * scale}`).join(" L ")} Z`;

/** A lightning bolt: code that runs because something else happened. A database trigger, a webhook, an event handler. */
const Trigger = ({ body, inset, glow }: ShapeProps) => (
  <>
    <path d={boltPath(1.12)} fill={body} stroke={body} strokeWidth={0.08} strokeLinejoin="round" />
    <path d={boltPath(0.7)} fill={inset} />
    <path d={boltPath(0.44)} fill={glow} />
  </>
);

/** A robot head: something that acts on its own. An automation, a bot, an AI assistant. */
const Agent = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.025} y={-0.56} width={0.05} height={0.16} fill={trim} />
    <circle cx={0} cy={-0.58} r={0.08} fill={glow} />
    <path d="M -0.24 0.36 L 0.24 0.36 L 0.3 0.64 L -0.3 0.64 Z" fill={trim} />
    {[-1, 1].map((side) => (
      <rect key={side} x={side * 0.72 - 0.06} y={-0.18} width={0.12} height={0.36} rx={0.04} fill={trim} />
    ))}
    <rect x={-0.66} y={-0.42} width={1.32} height={0.82} rx={0.16} fill={body} />
    <rect x={-0.5} y={-0.24} width={1.0} height={0.4} rx={0.08} fill={inset} />
    {[-0.24, 0.24].map((x) => (
      <circle key={x} cx={x} cy={-0.04} r={0.1} fill={glow} />
    ))}
  </>
);

const CHIP = 0.98;
const PINS = [-0.28, 0, 0.28];
const SPARK = `M ${Array.from({ length: 8 }, (_, point) => {
  const radius = point % 2 === 0 ? 0.3 : 0.08;
  const angle = (point / 8) * Math.PI * 2 - Math.PI / 2;
  return `${(radius * Math.cos(angle)).toFixed(3)} ${(radius * Math.sin(angle)).toFixed(3)}`;
}).join(" L ")} Z`;

/** A chip with a spark on it: the model itself, apart from the agent that calls it. */
const Model = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    {PINS.flatMap((offset) =>
      [-1, 1].flatMap((side) => [
        <rect key={`x${offset}${side}`} x={side * (CHIP / 2 + 0.06) - 0.07} y={offset - 0.05} width={0.14} height={0.1} rx={0.03} fill={trim} />,
        <rect key={`y${offset}${side}`} x={offset - 0.05} y={side * (CHIP / 2 + 0.06) - 0.07} width={0.1} height={0.14} rx={0.03} fill={trim} />,
      ]),
    )}
    <rect x={-CHIP / 2} y={-CHIP / 2} width={CHIP} height={CHIP} rx={0.1} fill={body} />
    <rect x={-0.37} y={-0.37} width={0.74} height={0.74} rx={0.06} fill={inset} />
    <path d={SPARK} fill={glow} stroke={glow} strokeWidth={0.03} strokeLinejoin="round" />
  </>
);

const TOWER_X = -0.3;
const WINDOW_COLUMNS = [-0.36, 0, 0.36];
const WINDOW_ROWS = [-0.4, -0.08, 0.24];

/** An office block: a system someone else runs. A partner's API, a payment provider, a regulator. */
const External = ({ body, inset, glow }: ShapeProps) => (
  <>
    <rect x={TOWER_X - 0.6} y={-0.64} width={1.2} height={1.28} rx={0.08} fill={body} />
    <rect x={0.26} y={-0.02} width={0.66} height={0.66} rx={0.08} fill={body} />
    {WINDOW_ROWS.flatMap((y, row) =>
      WINDOW_COLUMNS.map((x, column) => (
        <rect key={`${x}${y}`} x={TOWER_X + x - 0.11} y={y - 0.1} width={0.22} height={0.2} rx={0.03} fill={row === 1 && column === 1 ? glow : inset} />
      )),
    )}
    {[0.16, 0.42].map((y) => (
      <rect key={y} x={0.43} y={y - 0.08} width={0.32} height={0.16} rx={0.03} fill={inset} />
    ))}
  </>
);

/** A phone: a mobile app, a device that goes offline. */
const Phone = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.38} y={-0.65} width={0.76} height={1.3} rx={0.12} fill={body} />
    <rect x={-0.31} y={-0.55} width={0.62} height={1.04} rx={0.05} fill={inset} />
    <rect x={-0.24} y={-0.46} width={0.48} height={0.2} rx={0.04} fill={glow} />
    {[-0.18, 0.04, 0.26].map((y) => (
      <rect key={y} x={-0.24} y={y - 0.08} width={0.48} height={0.16} rx={0.04} fill={trim} />
    ))}
    <rect x={-0.12} y={0.54} width={0.24} height={0.05} rx={0.025} fill={trim} />
  </>
);

/** An envelope with an unread dot: a message leaving the system. An email, an alert, a push. */
const Notification = ({ body, inset, glow }: ShapeProps) => (
  <>
    <rect x={-0.84} y={-0.46} width={1.68} height={1.08} rx={0.1} fill={body} />
    <path d="M -0.76 -0.38 L 0 0.12 L 0.76 -0.38" fill="none" stroke={inset} strokeWidth={0.07} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={0.72} cy={-0.44} r={0.22} fill={inset} />
    <circle cx={0.72} cy={-0.44} r={0.16} fill={glow} />
  </>
);

/** A key: a credential. A token, a key pair, a signature. */
const Key = ({ body, inset, glow }: ShapeProps) => (
  <>
    <circle cx={0} cy={-0.29} r={0.24} fill="none" stroke={body} strokeWidth={0.22} />
    <rect x={-0.11} y={-0.1} width={0.22} height={0.74} rx={0.05} fill={body} />
    <rect x={0.05} y={0.22} width={0.4} height={0.16} rx={0.05} fill={body} />
    <rect x={0.05} y={0.46} width={0.3} height={0.16} rx={0.05} fill={body} />
    <rect x={-0.03} y={0.0} width={0.06} height={0.56} rx={0.03} fill={inset} />
    <Led x={0} y={-0.29} inset={inset} glow={glow} />
  </>
);

const ENTRIES: [y: number, width: number][] = [
  [-0.26, 0.6],
  [-0.1, 0.44],
  [0.06, 0.66],
  [0.22, 0.38],
];
const TAPE_LEFT = -0.34;

/** A printed tape: a record that only grows. History, a ledger, an audit trail. The newest line is lit. */
const Log = ({ body, trim, inset, glow }: ShapeProps) => (
  <>
    <path
      d="M -0.46 -0.5 L 0.46 -0.5 L 0.46 0.6 L 0.31 0.5 L 0.15 0.6 L 0 0.5 L -0.15 0.6 L -0.31 0.5 L -0.46 0.6 Z"
      fill={body}
      stroke={body}
      strokeWidth={0.04}
      strokeLinejoin="round"
    />
    <rect x={-0.62} y={-0.66} width={1.24} height={0.28} rx={0.14} fill={trim} />
    {ENTRIES.map(([y, width]) => (
      <rect key={y} x={TAPE_LEFT} y={y - 0.03} width={width} height={0.06} rx={0.03} fill={inset} />
    ))}
    <rect x={TAPE_LEFT - 0.04} y={0.31} width={0.6} height={0.14} rx={0.05} fill={inset} />
    <rect x={TAPE_LEFT} y={0.345} width={0.52} height={0.07} rx={0.035} fill={glow} />
  </>
);

/**
 * Every shape is drawn in a box 2 wide and 1.4 tall, centered on the origin,
 * with y running down. Node scales and places it.
 */
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
