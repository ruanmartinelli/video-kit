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
  layoutHub,
  layoutLanes,
  Manifest,
  Node,
  NODE_HEIGHT,
  Outcomes,
  Packet,
  Pipe,
  pop,
  pulse,
  Ripple,
  Schedule,
  Tables,
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

type BadgeChoice = "none" | "locked" | "syncing" | "failed" | "done";

export const NodeDemo = ({ label, shape, tone, badge }: { label: string; shape: NodeShape; tone: "accent" | "danger"; badge: BadgeChoice }) => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [origin], view: "close", azimuth: 20, elevation: 28, padding: 1.25 }]} />
      <Node
        position={origin}
        label={label}
        shape={shape}
        tone={tone}
        badge={badge === "none" ? undefined : badge}
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

export const PacketDemo = ({ tone, label, pipeLabel }: { tone: "accent" | "danger"; label: string; pipeLabel: string }) => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [left, right], padding: 1.3 }]} />
      <Pipe from={left} to={right} progress={ease(frame, 5, 30)} label={pipeLabel || undefined} />
      <Node position={left} label="From" />
      <Node position={right} label="To" active={pulse(frame, 85)} tone={tone} />
      <Packet from={left} to={right} progress={ease(frame, 40, 85)} tone={tone} label={label || undefined} />
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
      <Graph3D graph={graph} edges={Object.fromEntries(graph.edges.map((edge, index) => [edge.id, drawn(index)]))} />
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

const DIFF_CODE = `
for (const job of batch) {
  retry(job);
  retry(job, { max: 3 });
}
`;

export const CodePanelDemo = ({ side, title, diff }: { side: "left" | "right"; title: string; diff: "off" | "on" }) => {
  const frame = useCurrentFrame();
  const line = 2 + (Math.floor(frame / 40) % 3);
  return (
    <World
      overlay={
        diff === "on" ? (
          <CodePanel code={DIFF_CODE} title={title} side={side} removed={[2]} added={frame < 60 ? [] : [3]} appear={ease(frame, 5, 20)} />
        ) : (
          <CodePanel code={SAMPLE_CODE} title={title} side={side} highlight={frame < 30 ? [] : [line]} appear={ease(frame, 5, 20)} />
        )
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

export const TablesDemo = ({ direction, side }: { direction: "column" | "row"; side: "left" | "right" }) => {
  const frame = useCurrentFrame();
  const landed = 150;
  return (
    <World
      overlay={
        <Tables
          direction={direction}
          side={side}
          appear={ease(frame, 4, 18)}
          tables={[
            {
              name: "orders",
              columns: [
                { name: "id", type: "bigint pk" },
                { name: "total_cents", type: "int not null" },
                { name: "refunded_at", type: "timestamptz", change: "added", appear: ease(frame, 40, 58), lit: pulse(frame, landed, 30) },
              ],
            },
            {
              name: "refunds",
              change: "added",
              appear: pop(frame, 70),
              columns: [
                { name: "id", type: "bigint pk" },
                { name: "order_id", type: "bigint → orders.id" },
                { name: "reason", type: "text" },
              ],
            },
          ]}
          links={[{ from: "refunds.order_id", to: "orders.id", tone: "added", progress: ease(frame, 95, 115) }]}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: [left, right], padding: 1.5, shift: [side === "right" ? -0.2 : 0.2, 0] }]} />
      <Pipe from={left} to={right} />
      <Node position={left} label="Service" />
      <Node position={right} label="Postgres" shape="database" active={pulse(frame, landed, 24)} />
      <Packet from={left} to={right} progress={ease(frame, landed - 20, landed)} tone="accent" />
    </World>
  );
};

export const OutcomesDemo = ({ side }: { side: "left" | "right" }) => {
  const frame = useCurrentFrame();
  const graph = layoutGraph({
    nodes: [
      { id: "client", label: "Client", shape: "client" },
      { id: "guard", label: "requireAdmin", shape: "shield", change: "changed" },
      { id: "api", label: "Billing", shape: "controller" },
    ],
    edges: [
      ["client", "guard"],
      ["guard", "api"],
    ],
    columnGap: 5,
  });
  const [client, guard, api] = graph.nodes.map((node) => node.position) as [Vec3, Vec3, Vec3];
  // Each caller is sent twice: once before the change, once after it.
  const callers = [
    { name: "admin", was: true, now: true, before: 20, after: 110 },
    { name: "guest", was: false, now: true, before: 55, after: 145 },
  ];
  const leg = 16;
  const trip = (name: string, start: number, passes: boolean, wrong: boolean) => (
    <group key={start}>
      <Packet from={client} to={guard} progress={ease(frame, start, start + leg)} label={name} />
      <Packet from={guard} to={passes ? api : client} progress={ease(frame, start + leg, start + 2 * leg)} label={name} tone={wrong ? "danger" : "neutral"} />
    </group>
  );
  const flipped = 145 + leg;
  return (
    <World
      overlay={
        <Outcomes
          side={side}
          appear={ease(frame, 4, 16)}
          rows={callers.map((caller) => ({
            name: caller.name,
            before: caller.was ? "passes" : "blocked",
            after: caller.now ? "passes" : "blocked",
            filled: ease(frame, caller.before + leg - 4, caller.before + leg + 6) + ease(frame, caller.after + leg - 4, caller.after + leg + 6),
          }))}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), azimuth: -8, padding: 1.25, shift: [0, -0.16] }]} />
      <Graph3D graph={graph} nodes={{ guard: { active: ease(frame, flipped - 2, flipped + 8), tone: "danger" } }} />
      {callers.map((caller) => trip(caller.name, caller.before, caller.was, false))}
      {callers.map((caller) => trip(caller.name, caller.after, caller.now, caller.now !== caller.was))}
    </World>
  );
};

export const HubDemo = ({ callers }: { callers: number }) => {
  const frame = useCurrentFrame();
  const names = ["Checkout", "Invoices", "Cart", "Refunds", "Reports", "Payouts", "Receipts", "Taxes", "Search", "Emails"];
  const graph = layoutHub({
    hub: { id: "helper", label: "formatMoney()", shape: "file", change: "changed" },
    spokes: names.slice(0, callers).map((name, index) => ({ id: name, label: name, shape: "file", change: index < 2 ? ("changed" as const) : undefined })),
  });
  // The front moves at a steady pace, so the frame it reaches a spoke is known.
  const start = 40;
  const travel = 60;
  const progress = Math.min(1, Math.max(0, (frame - start) / travel));
  const reached = start + travel * 0.85;
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), elevation: 44, padding: 0.95 }]} />
      <Ripple at={graph.position("helper")} progress={progress} />
      <Graph3D
        graph={graph}
        nodes={Object.fromEntries(
          names
            .slice(2, callers)
            .map((name) => [name, { active: ease(frame, reached - 4, reached + 8), tone: frame >= reached - 4 ? ("danger" as const) : ("accent" as const) }]),
        )}
      />
    </World>
  );
};

export const ScheduleDemo = ({ side }: { side: "left" | "right" }) => {
  const frame = useCurrentFrame();
  const clock = layoutGraph({
    nodes: [
      { id: "clock", label: "Scheduler", shape: "clock", change: "changed" },
      { id: "job", label: "SyncUsageJob", shape: "worker" },
    ],
    edges: [["clock", "job"]],
  });
  return (
    <World
      overlay={
        <Schedule
          side={side}
          title="sync_usage"
          appear={ease(frame, 4, 16)}
          rows={[
            { label: "before", everyMinutes: 60, progress: ease(frame, 20, 70) },
            { label: "after", everyMinutes: 5, tone: "changed", progress: ease(frame, 80, 150) },
          ]}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: clock.nodes.map((node) => node.position), padding: 1.5, shift: [0, -0.2] }]} />
      <Graph3D graph={clock} nodes={{ clock: { active: pulse(frame, 80, 40) } }} />
    </World>
  );
};

export const ManifestDemo = ({ current }: { current: string }) => {
  const frame = useCurrentFrame();
  const items = [
    { kind: "Auth", name: "requireAdmin", change: "changed" as const, note: "existing policy changed" },
    { kind: "Shared code", name: "formatMoney()", change: "changed" as const, note: "8 callers, 5 not updated" },
    { kind: "New endpoint", name: "GET /invoices/export", change: "added" as const },
    { kind: "New cron", name: "ExpireKeysJob", change: "added" as const, note: "every 5 min" },
  ];
  return (
    <World
      overlay={
        <Manifest
          items={items.map((item, index) => ({ ...item, appear: ease(frame, 10 + index * 8, 22 + index * 8) }))}
          footer="31 other files: ordinary changes, not shown"
          current={current === "none" ? undefined : Number(current)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: pipelineTargets, azimuth: 10, padding: 0.9 }]} />
      <Focus on={[]} amount={0.82}>
        <Graph3D graph={pipeline} />
      </Focus>
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
    <World
      overlay={
        <Chip caption="new file" tone="added" appear={ease(frame, 20, 34)}>
          src/controllers/refunds.ts
        </Chip>
      }
    >
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), azimuth: 12 }]} />
      <Graph3D graph={graph} nodes={{ new: { active: pulse(frame, 30, 30) } }} />
    </World>
  );
};

export const LanesDemo = ({ gap }: { gap: number }) => {
  const frame = useCurrentFrame();
  const graph = layoutGraph({
    nodes: [
      { id: "client", label: "Client", shape: "phone" },
      { id: "api", label: "API", shape: "server" },
      { id: "jobs", label: "Jobs", shape: "worker" },
    ],
    edges: [
      ["client", "api"],
      ["api", "jobs"],
    ],
    columnGap: 5,
  });
  const { before, after } = layoutLanes(graph, { gap });
  const leg = 16;
  const start = 30;
  // The same request in both lanes, at the same moment. Only the old one fails.
  const failed = frame >= start + 2 * leg && frame < 150;
  const hop = (lane: typeof before, name: string, from: string, to: string, at: number, tone: "accent" | "danger") => (
    <Packet from={lane.position(`${name}/${from}`)} to={lane.position(`${name}/${to}`)} progress={ease(frame, at, at + leg)} tone={tone} />
  );
  return (
    <World>
      <CameraRig
        shots={[
          {
            at: 0,
            targets: [...before.nodes.map((node) => node.position), ...after.nodes.map((node) => node.position), before.labelAt],
            azimuth: 10,
            padding: 1.1,
          },
        ]}
      />
      <Label position={before.labelAt} size={0.5}>
        before
      </Label>
      <Label position={after.labelAt} size={0.5}>
        after
      </Label>
      <Graph3D graph={before} nodes={{ "before/jobs": { active: failed ? 1 : 0, tone: "danger", badge: failed ? "failed" : undefined } }} />
      <Graph3D
        graph={after}
        nodes={{ "after/jobs": { active: pulse(frame, start + 2 * leg, 24), badge: frame >= start + 2 * leg && frame < 150 ? "done" : undefined } }}
      />
      {hop(before, "before", "client", "api", start, "accent")}
      {hop(before, "before", "api", "jobs", start + leg, "danger")}
      {hop(after, "after", "client", "api", start, "accent")}
      {hop(after, "after", "api", "jobs", start + leg, "accent")}
    </World>
  );
};
