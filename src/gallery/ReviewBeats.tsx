// Scratch: how each kind of PR review item could look, rendered to pick a direction. Not part of the kit.
import { Billboard } from "@react-three/drei";
import type { ReactNode } from "react";
import { CameraRig, Chip, Focus, Graph3D, layoutGraph, lerp3, Node, NODE_HEIGHT, Packet, Pipe, Tables, theme, World, type Vec3 } from "../kit";
import { Type } from "../kit/Label";

const Y = NODE_HEIGHT / 2;

const Tag = ({ at, children, color = theme.text, size = 0.3 }: { at: Vec3; children: string; color?: string; size?: number }) => (
  <Billboard position={at}>
    <Type size={size} color={color}>
      {children}
    </Type>
  </Billboard>
);

/** Text riding above the middle of a pipe: what travels on it. */
const PipeLabel = ({ from, to, children, color }: { from: Vec3; to: Vec3; children: string; color?: string }) => {
  const [x, y, z] = lerp3(from, to, 0.5);
  return (
    <Tag at={[x, y + 0.55, z]} color={color} size={0.4}>
      {children}
    </Tag>
  );
};

/** A packet that says who it is. */
const Who = ({ from, to, at, name, tone }: { from: Vec3; to: Vec3; at: number; name: string; tone: "neutral" | "accent" | "danger" }) => {
  const [x, y, z] = lerp3(from, to, at);
  return (
    <>
      <Packet from={from} to={to} clear={[0, 0]} progress={at} tone={tone} />
      <Tag at={[x, y + 0.7, z]} color={tone === "danger" ? theme.danger : theme.text} size={0.3}>
        {name}
      </Tag>
    </>
  );
};

const panel = { background: theme.panel, border: `2px solid ${theme.panelBorder}`, borderRadius: 14 } as const;

// 0. Manifest ---------------------------------------------------------------

const ITEMS: { tone: "added" | "changed"; kind: string; what: string; note: string }[] = [
  { tone: "changed", kind: "Auth", what: "requireAdmin", note: "existing policy changed" },
  { tone: "changed", kind: "Shared code", what: "formatMoney()", note: "8 callers, 5 outside this PR" },
  { tone: "added", kind: "New endpoint", what: "POST /api-keys", note: "" },
  { tone: "added", kind: "New mutation", what: "createApiKey", note: "" },
  { tone: "added", kind: "New cron", what: "ExpireKeysJob", note: "every 5 min" },
];

const path = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "client" },
    { id: "router", label: "Router", shape: "router" },
    { id: "controller", label: "Controller", shape: "controller" },
    { id: "service", label: "Service" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["client", "router"],
    ["router", "controller"],
    ["controller", "service"],
    ["service", "db"],
  ],
  columnGap: 5,
});

const Manifest = () => (
  <World
    overlay={
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 30, color: theme.textDim, marginBottom: 10 }}>What to look at in this PR</div>
        {ITEMS.map((item) => (
          <div key={item.kind} style={{ ...panel, width: 1080, display: "flex", alignItems: "center", gap: 22, padding: "20px 30px", boxSizing: "border-box" }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: theme[item.tone] }} />
            <span style={{ width: 250, fontFamily: theme.sans, fontWeight: 600, fontSize: 34, color: theme.text }}>{item.kind}</span>
            <span style={{ fontFamily: theme.mono, fontWeight: 500, fontSize: 28, color: theme[item.tone] }}>{item.what}</span>
            <span style={{ marginLeft: "auto", fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim }}>{item.note}</span>
          </div>
        ))}
        <div style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 26, color: theme.textDim, marginTop: 12 }}>31 other files: ordinary changes, not shown</div>
      </div>
    }
  >
    <CameraRig sway={0} shots={[{ at: 0, targets: path.nodes.map((node) => node.position), azimuth: 10, padding: 0.9 }]} />
    <Focus on={[]} amount={0.82}>
      <Graph3D graph={path} />
    </Focus>
  </World>
);

// 1. New endpoint -----------------------------------------------------------

const routes = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "client" },
    { id: "router", label: "Router", shape: "router", change: "changed" },
    { id: "users", label: "UsersController", shape: "controller" },
    { id: "keys", label: "ApiKeysController", shape: "controller", change: "added" },
    { id: "orders", label: "OrdersController", shape: "controller" },
  ],
  edges: [
    ["client", "router"],
    ["router", "users"],
    ["router", "keys"],
    ["router", "orders"],
  ],
  columnGap: 8,
  rowGap: 5.5,
});

const Endpoint = () => {
  const router = routes.position("router");
  const keys = routes.position("keys");
  return (
    <World overlay={<Chip caption="new endpoint" tone="added">POST /api-keys</Chip>}>
      <CameraRig sway={0} shots={[{ at: 0, targets: routes.nodes.map((node) => node.position), azimuth: 14, padding: 1 }]} />
      <Graph3D graph={routes} edges={{ "router->keys": 0 }} nodes={{ keys: { active: 0.35 } }} />
      <Pipe from={router} to={keys} tone="added" />
      <PipeLabel from={router} to={routes.position("users")} color={theme.textDim}>
        GET /users
      </PipeLabel>
      <PipeLabel from={router} to={keys} color={theme.added}>
        POST /api-keys
      </PipeLabel>
      <PipeLabel from={router} to={routes.position("orders")} color={theme.textDim}>
        GET /orders
      </PipeLabel>
      <Packet from={routes.position("client")} to={router} progress={0.999} />
      <Packet from={router} to={keys} progress={0.72} tone="accent" />
    </World>
  );
};

// 2. New GraphQL field / mutation ------------------------------------------

const gql = layoutGraph({
  nodes: [
    { id: "server", label: "GraphQL", shape: "server" },
    { id: "resolver", label: "createApiKey resolver", shape: "file", change: "added" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["server", "resolver"],
    ["resolver", "db"],
  ],
  columnGap: 5.5,
});

const GraphQL = () => (
  <World
    overlay={
      <Tables
        side="left"
        tables={[
          {
            name: "type Mutation",
            columns: [
              { name: "createUser", type: "User!" },
              { name: "createApiKey", type: "ApiKey!", change: "added", lit: 1 },
            ],
          },
          {
            name: "type User",
            columns: [
              { name: "id", type: "ID!" },
              { name: "email", type: "String!" },
              { name: "apiKeyLimit", type: "Int!", change: "added" },
            ],
          },
        ]}
      />
    }
  >
    <CameraRig sway={0} shots={[{ at: 0, targets: gql.nodes.map((node) => node.position), azimuth: -8, padding: 1.55, shift: [0.17, 0] }]} />
    <Graph3D graph={gql} nodes={{ resolver: { active: 0.5 } }} />
    <Packet from={gql.position("server")} to={gql.position("resolver")} progress={0.999} />
    <Packet from={gql.position("resolver")} to={gql.position("db")} progress={0.6} tone="accent" />
  </World>
);

// 3. New job / cron ---------------------------------------------------------

const jobs = layoutGraph({
  nodes: [
    { id: "service", label: "ApiKeyService" },
    { id: "clock", label: "Scheduler", shape: "clock", change: "changed" },
    { id: "queue", label: "Queue", shape: "queue" },
    { id: "worker", label: "ExpireKeysJob", shape: "worker", change: "added" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["service", "queue"],
    ["queue", "worker"],
    ["clock", "worker"],
    ["worker", "db"],
  ],
  columnGap: 5.5,
  rowGap: 5,
});

const Ticks = ({ count, color, label }: { count: number; color: string; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
    <span style={{ width: 150, fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim }}>{label}</span>
    <div style={{ position: "relative", width: 560, height: 34, borderBottom: `2px solid ${theme.panelBorder}` }}>
      {Array.from({ length: count }, (_, tick) => (
        <span key={tick} style={{ position: "absolute", left: (tick / count) * 560, bottom: 0, width: 3, height: 26, background: color }} />
      ))}
    </div>
  </div>
);

const Cron = () => (
  <World
    overlay={
      <div style={{ ...panel, position: "absolute", top: 72, right: 96, padding: "24px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: theme.mono, fontWeight: 500, fontSize: 26, color: theme.text }}>expire_api_keys, over 6 hours</div>
        <Ticks count={6} color={theme.textDim} label="before, hourly" />
        <Ticks count={72} color={theme.changed} label="after, 5 min" />
      </div>
    }
  >
    <CameraRig sway={0} shots={[{ at: 0, targets: jobs.nodes.map((node) => node.position), azimuth: 10, padding: 1.05, shift: [0, -0.06] }]} />
    <Graph3D graph={jobs} nodes={{ worker: { active: 0.4 }, clock: { active: 0.5 } }} />
    <Packet from={jobs.position("clock")} to={jobs.position("worker")} progress={0.62} tone="accent" />
    <Packet from={jobs.position("queue")} to={jobs.position("worker")} progress={0.3} />
    <Packet from={jobs.position("worker")} to={jobs.position("db")} progress={0.5} tone="accent" />
  </World>
);

// 4. Auth -------------------------------------------------------------------

const guarded = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "client" },
    { id: "guard", label: "requireAdmin", shape: "shield", change: "changed" },
    { id: "controller", label: "BillingController", shape: "controller" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["client", "guard"],
    ["guard", "controller"],
    ["controller", "db"],
  ],
  columnGap: 5.2,
});

const OUTCOMES: { who: string; before: boolean; after: boolean }[] = [
  { who: "member", before: false, after: false },
  { who: "admin", before: true, after: true },
  { who: "superadmin", before: true, after: true },
  { who: "admin, other tenant", before: false, after: true },
];

const Outcome = ({ passes, alarm }: { passes: boolean; alarm?: boolean }) => (
  <span style={{ width: 130, fontFamily: theme.mono, fontWeight: 500, fontSize: 24, color: alarm ? theme.removed : passes ? theme.text : theme.textDim }}>
    {passes ? "passes" : "blocked"}
  </span>
);

const Auth = () => {
  const at = (id: string) => guarded.position(id);
  return (
    <World
      overlay={
        <div style={{ ...panel, position: "absolute", top: 150, right: 96, width: 640, overflow: "hidden" }}>
          <div style={{ display: "flex", padding: "18px 28px", borderBottom: `2px solid ${theme.panelBorder}`, fontFamily: theme.sans, fontWeight: 600, fontSize: 24, color: theme.textDim }}>
            <span style={{ flex: 1 }}>who asks</span>
            <span style={{ width: 130 }}>before</span>
            <span style={{ width: 130 }}>after</span>
          </div>
          {OUTCOMES.map((row) => {
            const changed = row.before !== row.after;
            return (
              <div
                key={row.who}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 28px",
                  background: changed ? `color-mix(in srgb, ${theme.removed} 12%, transparent)` : "transparent",
                  boxShadow: changed ? `inset 5px 0 0 ${theme.removed}` : "none",
                }}
              >
                <span style={{ flex: 1, fontFamily: theme.mono, fontWeight: 500, fontSize: 26, color: changed ? theme.removed : theme.text }}>{row.who}</span>
                <Outcome passes={row.before} />
                <Outcome passes={row.after} alarm={changed} />
              </div>
            );
          })}
        </div>
      }
    >
      <CameraRig sway={0} shots={[{ at: 0, targets: guarded.nodes.map((node) => node.position), azimuth: -10, padding: 1.15, shift: [-0.02, -0.2] }]} />
      <Graph3D graph={guarded} nodes={{ guard: { active: 0.6, tone: "danger" } }} />
      <Who from={at("client")} to={at("guard")} at={0.72} name="member" tone="neutral" />
      <Who from={at("guard")} to={at("controller")} at={0.42} name="admin" tone="accent" />
      <Who from={at("guard")} to={at("controller")} at={0.74} name="superadmin" tone="accent" />
      <Who from={at("controller")} to={at("db")} at={0.5} name="other tenant" tone="danger" />
    </World>
  );
};

// 5. Shared code ------------------------------------------------------------

const CALLERS: { name: string; inPr: boolean }[] = [
  { name: "CheckoutService", inPr: true },
  { name: "InvoiceMailer", inPr: true },
  { name: "CartController", inPr: true },
  { name: "RefundJob", inPr: false },
  { name: "AdminReports", inPr: false },
  { name: "PayoutExport", inPr: false },
  { name: "ReceiptPdf", inPr: false },
  { name: "TaxSummary", inPr: false },
];
const helper: Vec3 = [0, Y, 0];
const callerAt = (index: number): Vec3 => {
  const angle = (index / CALLERS.length) * Math.PI * 2 + Math.PI / 8;
  return [Math.cos(angle) * 8.2, Y, Math.sin(angle) * 5.6];
};

const Ring = ({ radius, opacity }: { radius: number; opacity: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[1, 0.68, 1]}>
    <ringGeometry args={[radius - 0.07, radius + 0.07, 96]} />
    <meshBasicMaterial color={theme.changed} toneMapped={false} transparent opacity={opacity} />
  </mesh>
);

const Shared = (): ReactNode => (
  <World
    overlay={
      <Chip caption="shared helper, behaviour changed" tone="changed">
        src/lib/formatMoney.ts · 8 callers, 5 outside this PR
      </Chip>
    }
  >
    <CameraRig sway={0} shots={[{ at: 0, targets: CALLERS.map((_, index) => callerAt(index)), elevation: 44, padding: 0.95, shift: [0, -0.04] }]} />
    <Ring radius={3} opacity={0.75} />
    <Ring radius={5.4} opacity={0.5} />
    <Ring radius={7.6} opacity={0.28} />
    {CALLERS.map((caller, index) => (
      <group key={caller.name}>
        <Pipe from={callerAt(index)} to={helper} />
        <Node
          position={callerAt(index)}
          label={caller.name}
          shape="file"
          change={caller.inPr ? "changed" : undefined}
          active={caller.inPr ? 0 : 0.7}
          tone="danger"
        />
      </group>
    ))}
    <Node position={helper} label="formatMoney()" shape="file" change="changed" />
  </World>
);

export const reviewBeats: { id: string; component: () => ReactNode }[] = [
  { id: "Beat0Manifest", component: Manifest },
  { id: "Beat1Endpoint", component: Endpoint },
  { id: "Beat2GraphQL", component: GraphQL },
  { id: "Beat3Cron", component: Cron },
  { id: "Beat4Auth", component: Auth },
  { id: "Beat5Shared", component: Shared },
];
