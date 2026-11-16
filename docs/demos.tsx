import { useCurrentFrame } from "remotion";
import {
  CameraRig,
  Caption,
  Chip,
  CodePanel,
  ease,
  Focus,
  Graph3D,
  Label,
  layoutGraph,
  Node,
  NODE_HEIGHT,
  Packet,
  Pipe,
  pop,
  pulse,
  Table,
  TABLE_CLEAR,
  tableFrame,
  tableRow,
  theme,
  World,
  type NodeShape,
  type Vec3,
} from "../src/kit";
import { timeline } from "../src/videos/load-balancer/LoadBalancer";

/** Demo scenes for the docs. Each takes the values of its controls as props. */

const Y = NODE_HEIGHT / 2;
const origin: Vec3 = [0, Y, 0];
const left: Vec3 = [-3.5, Y, 0];
const right: Vec3 = [3.5, Y, 0];

const pipeline = layoutGraph({
  nodes: [
    { id: "api", label: "API" },
    { id: "queue", label: "Queue", shape: "queue" },
    { id: "worker", label: "Worker", shape: "server" },
  ],
  edges: [
    ["api", "queue"],
    ["queue", "worker"],
  ],
});
const pipelineTargets = pipeline.nodes.map((node) => node.position);

export const WorldDemo = () => (
  <World overlay={<div className="overlay-note">overlay</div>}>
    <CameraRig shots={[{ at: 0, targets: [origin], padding: 1.6 }]} />
    <Node position={origin} label="An actor" />
  </World>
);

export const CameraDemo = ({ view, azimuth, sway }: { view: "wide" | "close" | "low" | "top"; azimuth: number; sway: number }) => (
  <World>
    <CameraRig
      sway={sway}
      shots={[
        { at: 0, targets: pipelineTargets },
        { at: 40, targets: [pipeline.position("queue")], view, azimuth },
        { at: 150, targets: pipelineTargets },
      ]}
    />
    <Graph3D graph={pipeline} />
  </World>
);

export const NodeDemo = ({ label, shape, tone }: { label: string; shape: NodeShape; tone: "accent" | "danger" }) => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [origin], view: "close", azimuth: 20, elevation: 28, padding: 1.25 }]} />
      <Node
        position={origin}
        label={label}
        shape={shape}
        tone={tone}
        appear={pop(frame, 8)}
        active={pulse(frame, 55, 30)}
        open={ease(frame, 105, 125) * (1 - ease(frame, 185, 200))}
      >
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, -0.2, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={theme.surface} emissive={theme.accent} emissiveIntensity={0.5} />
          </mesh>
        ))}
      </Node>
    </World>
  );
};

export const PacketDemo = ({ tone }: { tone: "accent" | "danger" }) => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [left, right], padding: 1.3 }]} />
      <Pipe from={left} to={right} progress={ease(frame, 5, 30)} />
      <Node position={left} label="From" />
      <Node position={right} label="To" active={pulse(frame, 85)} tone={tone} />
      <Packet from={left} to={right} progress={ease(frame, 40, 85)} tone={tone} />
    </World>
  );
};

export const GraphDemo = ({ columnGap, rowGap }: { columnGap: number; rowGap: number }) => {
  const frame = useCurrentFrame();
  const graph = layoutGraph({
    nodes: [
      { id: "web", label: "Web", shape: "client" },
      { id: "api", label: "API", shape: "server" },
      { id: "cache", label: "Cache" },
      { id: "db", label: "Database", shape: "database" },
      { id: "replica", label: "Replica", shape: "database" },
    ],
    edges: [
      ["web", "api"],
      ["api", "cache"],
      ["api", "db"],
      ["db", "replica"],
    ],
    columnGap,
    rowGap,
  });
  const drawn = (index: number) => ease(frame, 15 + index * 12, 35 + index * 12);

  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), azimuth: 14 }]} />
      <Graph3D
        graph={graph}
        edges={Object.fromEntries(graph.edges.map((edge, index) => [edge.id, drawn(index)]))}
      />
    </World>
  );
};

export const FocusDemo = ({ on }: { on: string }) => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: pipelineTargets, azimuth: 12 }]} />
      <Focus on={[on]} amount={ease(frame, 25, 45) * (1 - ease(frame, 110, 130))}>
        <Graph3D graph={pipeline} />
      </Focus>
    </World>
  );
};

export const LabelDemo = ({ text, size }: { text: string; size: number }) => (
  <World>
    <CameraRig sway={14} shots={[{ at: 0, targets: [origin], view: "close", padding: 1.3 }]} />
    <mesh position={origin}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={theme.surface} />
    </mesh>
    <Label position={[0, Y + 0.7, 0]} size={size}>
      {text}
    </Label>
  </World>
);

const SAMPLE_CODE = `
function pick() {
  const server = servers[turn];
  turn = (turn + 1) % servers.length;
  return server;
}
`;

export const CodePanelDemo = ({ side, title }: { side: "left" | "right"; title: string }) => {
  const frame = useCurrentFrame();
  const line = 2 + (Math.floor(frame / 40) % 3);
  return (
    <World
      overlay={
        <CodePanel code={SAMPLE_CODE} title={title} side={side} highlight={frame < 30 ? [] : [line]} appear={ease(frame, 5, 20)} />
      }
    >
      <CameraRig shots={[{ at: 0, targets: [origin], view: "close", padding: 1.5, shift: [side === "right" ? -0.22 : 0.22, 0.04] }]} />
      <Node position={origin} label="Balancer" active={pulse(frame, 30 + 40 * Math.floor(frame / 40), 20)} />
    </World>
  );
};

export const CAPTION_DEMO_FRAMES = timeline.end("idea") + 20;

export const CaptionDemo = ({ wordsPerLine }: { wordsPerLine: number }) => (
  <World overlay={<Caption timeline={timeline} wordsPerLine={wordsPerLine} />}>
    <CameraRig shots={[{ at: 0, targets: [origin], padding: 1.6 }]} />
    <Node position={origin} label="Server" />
  </World>
);

const ordersAt: Vec3 = [-3.4, 0, 0];
const refundsAt: Vec3 = [3.4, 0, 0];

export const TableDemo = ({ change }: { change: "added" | "changed" | "removed" }) => {
  const frame = useCurrentFrame();
  const orders = [
    { name: "id", type: "bigint pk" },
    { name: "total_cents", type: "int not null" },
    { name: "refunded_at", type: "timestamptz", change, appear: ease(frame, 40, 58), lit: pulse(frame, 150, 30) },
  ];
  const refunds = [
    { name: "id", type: "bigint pk" },
    { name: "order_id", type: "bigint → orders.id", lit: pulse(frame, 95, 30) },
    { name: "reason", type: "text" },
  ];
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [...tableFrame(ordersAt, orders), ...tableFrame(refundsAt, refunds)], elevation: 30, padding: 0.8, shift: [0, 0] }]} />
      <Table position={ordersAt} name="orders" columns={orders} />
      <Table position={refundsAt} name="refunds" change="added" columns={refunds} appear={pop(frame, 10)} />
      <Pipe
        from={tableRow(refundsAt, refunds, "order_id")}
        to={tableRow(ordersAt, orders, "id")}
        clear={[TABLE_CLEAR, TABLE_CLEAR]}
        tone="added"
        progress={ease(frame, 80, 100)}
      />
      <Packet from={[0, 0.6, 6]} to={tableRow(ordersAt, orders, "refunded_at")} clear={[0, 0.35]} progress={ease(frame, 125, 150)} tone="accent" />
    </World>
  );
};

export const ChangeDemo = () => {
  const frame = useCurrentFrame();
  const graph = layoutGraph({
    nodes: [
      { id: "router", label: "Router", change: "changed" },
      { id: "new", label: "RefundsController", change: "added" },
      { id: "old", label: "LegacyRefunds", change: "removed" },
      { id: "db", label: "Postgres", shape: "database" },
    ],
    edges: [
      ["router", "new"],
      ["router", "old"],
      ["new", "db"],
    ],
  });
  return (
    <World overlay={<Chip caption="new file" tone="added" appear={ease(frame, 20, 34)}>src/controllers/refunds.ts</Chip>}>
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), azimuth: 12 }]} />
      <Graph3D graph={graph} nodes={{ new: { active: pulse(frame, 30, 30) } }} />
    </World>
  );
};
