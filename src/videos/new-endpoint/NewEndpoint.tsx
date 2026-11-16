import { useCurrentFrame } from "remotion";
import {
  CameraRig,
  Caption,
  Chip,
  CodePanel,
  createTimeline,
  ease,
  edgeId,
  Focus,
  Graph3D,
  layoutGraph,
  Narration,
  Packet,
  pop,
  pulse,
  World,
} from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const newEndpointMeta = {
  id: "NewEndpoint",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// The auth check is a node, so a route that skips it shows as a pipe that goes around it.
const graph = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "client" },
    { id: "router", label: "Router", shape: "router", change: "changed" },
    { id: "auth", label: "requireAuth", shape: "shield" },
    { id: "users", label: "UsersController", shape: "controller" },
    { id: "orders", label: "OrdersController", shape: "controller" },
    { id: "export", label: "ExportController", shape: "controller", change: "added" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["client", "router"],
    ["router", "auth"],
    ["auth", "users"],
    ["auth", "orders"],
    ["router", "export"],
    ["users", "db"],
    ["orders", "db"],
    ["export", "db"],
  ],
  columnGap: 4.8,
  rowGap: 5.8,
});

const at = (id: string) => graph.position(id);
const everything = graph.nodes.map((node) => node.position);

const t = timeline;
const cue = {
  endpoint: t.at("intro", "endpoint"),
  existing: t.at("existing"),
  every: t.at("existing", "every"),
  auth: t.at("existing", "auth"),
  added: t.at("added"),
  route: t.at("added", "route"),
  controller: t.at("added", "controller"),
  follow: t.at("follow"),
  router: t.at("follow", "router"),
  straight: t.at("follow", "straight"),
  reads: t.at("follow", "reads"),
  risk: t.at("risk"),
  registered: t.at("risk", "registered"),
  outside: t.at("risk", "outside"),
  anyone: t.at("risk", "anyone"),
};

const LEG = 13;

// Two ordinary requests, to show the path every existing route takes.
const TRAFFIC = [
  { start: cue.every, to: "users" },
  { start: cue.every + 22, to: "orders" },
];

const CODE = `
router.use("/api", requireAuth, api);
api.get("/users", users.index);
api.get("/orders", orders.index);

router.get("/invoices/export", exportAll);
`;

export const NewEndpoint = () => {
  const frame = useCurrentFrame();

  const hop = (from: string, to: string, start: number, extra: { label?: string; tone?: "neutral" | "accent" | "danger" } = {}) => (
    <Packet key={from + to + start} from={at(from)} to={at(to)} progress={ease(frame, start, start + LEG)} {...extra} />
  );
  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  const codeIn = ease(frame, cue.registered - 6, cue.registered + 8);
  const routeIn = ease(frame, cue.route, cue.controller);
  // The request the video follows, and the one nobody checked.
  const followed = cue.router - LEG;
  const anyone = cue.anyone - LEG;

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="new route" tone="added" appear={between(cue.endpoint, cue.added)}>
            GET /invoices/export
          </Chip>
          <Chip caption="new file" tone="added" appear={between(cue.added + 4, cue.risk)}>
            src/controllers/exportController.ts
          </Chip>
          <Chip caption="changed file" tone="changed" appear={between(cue.risk + 4, t.durationInFrames + 20)}>
            src/routes.ts
          </Chip>
          <CodePanel code={CODE} title="routes.ts" highlight={frame < cue.outside - 4 ? [1, 2, 3] : [5]} appear={codeIn} />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: everything, azimuth: 8, padding: 1, shift: [0, 0.08] },
          { at: cue.added - 8, targets: [at("router"), at("users"), at("export")], azimuth: -6, padding: 1.12 },
          { at: cue.follow - 8, targets: everything, azimuth: 10, padding: 1, shift: [0, 0.08] },
          { at: cue.risk - 6, targets: [at("router"), at("auth"), at("export")], azimuth: -10, padding: 1.85, shift: [-0.27, 0.03] },
        ]}
      />

      <Focus on={["router", "auth", "export", edgeId("router", "auth"), edgeId("router", "export")]} amount={codeIn}>
        <Graph3D
          graph={graph}
          edges={{
            [edgeId("router", "auth")]: { label: "/api/*" },
            [edgeId("router", "export")]: { tone: "added", label: "GET /invoices/export", progress: routeIn },
            [edgeId("export", "db")]: { tone: "added", progress: ease(frame, cue.controller + 4, cue.controller + 18) },
          }}
          nodes={{
            router: {
              active: Math.max(...TRAFFIC.map(({ start }) => pulse(frame, start + LEG, 14)), pulse(frame, cue.route, 30), pulse(frame, cue.router, 20)),
            },
            auth: { active: Math.max(...TRAFFIC.map(({ start }) => pulse(frame, start + 2 * LEG, 20)), pulse(frame, cue.auth, 30)) },
            users: { active: pulse(frame, TRAFFIC[0]!.start + 3 * LEG, 18) },
            orders: { active: pulse(frame, TRAFFIC[1]!.start + 3 * LEG, 18) },
            export: {
              appear: pop(frame, cue.controller - 8, FPS),
              active: Math.max(pulse(frame, cue.controller, 30), pulse(frame, cue.straight + LEG, 24), ease(frame, anyone + 2 * LEG - 2, anyone + 2 * LEG + 8)),
              tone: frame >= anyone + 2 * LEG - 2 ? "danger" : "accent",
            },
            db: { active: Math.max(...TRAFFIC.map(({ start }) => pulse(frame, start + 4 * LEG, 16)), pulse(frame, cue.reads + LEG, 40)) },
          }}
        />
      </Focus>

      {TRAFFIC.flatMap(({ start, to }) => [
        hop("client", "router", start),
        hop("router", "auth", start + LEG),
        hop("auth", to, start + 2 * LEG),
        hop(to, "db", start + 3 * LEG),
      ])}

      {hop("client", "router", followed, { tone: "accent" })}
      {hop("router", "export", cue.straight, { tone: "accent" })}
      {hop("export", "db", cue.reads, { tone: "accent" })}

      {hop("client", "router", anyone, { label: "anyone", tone: "danger" })}
      {hop("router", "export", anyone + LEG, { label: "anyone", tone: "danger" })}
    </World>
  );
};
