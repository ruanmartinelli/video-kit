import { useCurrentFrame } from "remotion";
import { CameraRig, Caption, Chip, CodePanel, createTimeline, ease, Focus, Graph3D, layoutGraph, Narration, Outcomes, Packet, pulse, World } from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const prAuthMeta = {
  id: "PrAuth",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// The request path. Only the check changed, so only the check carries `change`.
const graph = layoutGraph({
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

const client = graph.position("client");
const guard = graph.position("guard");
const controller = graph.position("controller");
const db = graph.position("db");
const path = graph.nodes.map((node) => node.position);

const t = timeline;
const cue = {
  who: t.at("intro", "who"),
  guard: t.at("guard"),
  every: t.at("guard", "request"),
  rewrites: t.at("rewrite", "rewrites"),
  before: t.at("before"),
  replay: t.at("replay"),
  same: t.at("same"),
  flip: t.at("flip"),
  risk: t.at("risk"),
  early: t.at("risk", "early"),
  tenant: t.at("risk", "tenant"),
};

const LEG = 14;

// The same four callers are sent twice: `before` is the frame each one leaves
// the client on the base branch, `after` the frame it leaves with this PR.
// `tag` is the short name that rides on the packet.
const CALLERS = [
  {
    name: "member",
    tag: "member",
    was: false,
    now: false,
    before: t.at("base", "member"),
    after: t.at("replay", "requests"),
  },
  {
    name: "admin",
    tag: "admin",
    was: true,
    now: true,
    before: t.at("base", "admin"),
    after: cue.same,
  },
  {
    name: "superadmin",
    tag: "superadmin",
    was: true,
    now: true,
    before: t.at("base", "superadmin"),
    after: t.at("same", "get"),
  },
  {
    name: "admin, other tenant",
    tag: "other tenant",
    was: false,
    now: true,
    before: t.at("base", "admin", 1),
    after: t.at("flip", "passes") - LEG,
  },
].map((caller) => ({ ...caller, before: caller.before - 6 }));

// Before any of that: plain traffic, to show that every request meets the check.
const TRAFFIC = [0, 12, 24].map((offset) => cue.every + offset);

const answer = (passes: boolean) => (passes ? "passes" : "blocked");
const reaches = (start: number) => start + LEG;

const CODE = `
function requireAdmin(req) {
  const { user, tenantId } = req;
  if (ADMIN_ROLES.includes(user.role)) {
    return allow();
  }
  if (user.tenantId !== tenantId) {
    return deny();
  }
  return hasBilling(user) ? allow() : deny();
}
`;

export const PrAuth = () => {
  const frame = useCurrentFrame();

  // One caller's trip: to the check, then on to the controller or back where it came from.
  const trip = (name: string, start: number, passes: boolean, wrong: boolean) => {
    const hit = reaches(start);
    const tone = wrong ? "danger" : "neutral";
    return (
      <group key={`${name}-${start}`}>
        <Packet from={client} to={guard} progress={ease(frame, start, hit)} label={name} />
        {passes ? (
          <>
            <Packet from={guard} to={controller} progress={ease(frame, hit, hit + LEG)} label={name} tone={tone} />
            {wrong ? <Packet from={controller} to={db} progress={ease(frame, hit + LEG, hit + 2 * LEG)} label={name} tone={tone} /> : null}
          </>
        ) : (
          <Packet from={guard} to={client} progress={ease(frame, hit, hit + LEG)} label={name} />
        )}
      </group>
    );
  };

  const leak = CALLERS.find((caller) => caller.now !== caller.was);
  const leaked = leak ? reaches(leak.after) : Infinity;
  const passed = CALLERS.flatMap((caller) => [
    ...(caller.was ? [reaches(caller.before)] : []),
    ...(caller.now && caller !== leak ? [reaches(caller.after)] : []),
  ]);

  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  const codeIn = ease(frame, cue.risk + 4, cue.risk + 18);

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="changed file" tone="changed" appear={between(cue.rewrites, cue.before)}>
            src/auth/requireAdmin.ts
          </Chip>
          <Chip caption="before this PR" appear={between(cue.before, cue.replay)}>
            src/auth/requireAdmin.ts
          </Chip>
          <Chip caption="with this PR" tone="changed" appear={between(cue.replay, t.durationInFrames + 20)}>
            src/auth/requireAdmin.ts
          </Chip>
          <Outcomes
            appear={between(cue.before, cue.risk + 4)}
            rows={CALLERS.map((caller) => ({
              name: caller.name,
              before: answer(caller.was),
              after: answer(caller.now),
              filled: ease(frame, reaches(caller.before) - 4, reaches(caller.before) + 6) + ease(frame, reaches(caller.after) - 4, reaches(caller.after) + 6),
            }))}
          />
          <CodePanel code={CODE} title="requireAdmin" highlight={frame < cue.tenant ? [3, 4] : [3, 4, 6, 7]} appear={codeIn} />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        shots={[
          { at: 0, targets: path, azimuth: 8 },
          {
            at: cue.guard - 6,
            targets: [guard],
            view: "close",
            azimuth: -18,
            padding: 2.4,
          },
          {
            at: cue.before - 10,
            targets: path,
            azimuth: 12,
            elevation: 27,
            padding: 1,
            shift: [0, -0.2],
          },
          {
            at: cue.risk - 6,
            targets: [guard],
            view: "close",
            azimuth: -16,
            padding: 1.6,
            shift: [-0.27, 0.04],
          },
        ]}
      />

      <Focus on={["guard"]} amount={codeIn}>
        <Graph3D
          graph={graph}
          nodes={{
            guard: {
              active: Math.max(
                pulse(frame, cue.who, 30),
                pulse(frame, cue.rewrites, 30),
                ...[...TRAFFIC.map(reaches), ...passed].map((at) => pulse(frame, at, 16)),
                ease(frame, leaked - 2, leaked + 8),
              ),
              tone: frame >= leaked - 2 ? "danger" : "accent",
            },
            controller: {
              active: Math.max(...passed.map((at) => pulse(frame, at + LEG, 20)), pulse(frame, leaked + LEG, 24)),
              tone: frame >= leaked ? "danger" : "accent",
            },
            db: { active: pulse(frame, leaked + 2 * LEG, 45), tone: "danger" },
          }}
        />
      </Focus>

      {TRAFFIC.map((start) => (
        <group key={start}>
          <Packet from={client} to={guard} progress={ease(frame, start, reaches(start))} />
          <Packet from={guard} to={controller} progress={ease(frame, reaches(start), reaches(start) + LEG)} />
        </group>
      ))}
      {CALLERS.map((caller) => trip(caller.tag, caller.before, caller.was, false))}
      {CALLERS.map((caller) => trip(caller.tag, caller.after, caller.now, caller === leak))}
    </World>
  );
};
