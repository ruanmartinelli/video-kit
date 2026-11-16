import { useCurrentFrame } from "remotion";
import {
  CameraRig,
  Caption,
  CodePanel,
  createTimeline,
  ease,
  Focus,
  Graph3D,
  Label,
  layoutGraph,
  Narration,
  Packet,
  Pipe,
  pop,
  pulse,
  theme,
  World,
} from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const loadBalancerMeta = {
  id: "LoadBalancer",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

const graph = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "client" },
    { id: "lb", label: "Load balancer" },
    { id: "a", label: "Server A", shape: "server" },
    { id: "b", label: "Server B", shape: "server" },
    { id: "c", label: "Server C", shape: "server" },
  ],
  edges: [
    ["client", "lb"],
    ["lb", "a"],
    ["lb", "b"],
    ["lb", "c"],
  ],
});

const client = graph.position("client");
const lb = graph.position("lb");
const serverB = graph.position("b");
const everything = graph.nodes.map((node) => node.position);

const t = timeline;
const cue = {
  flood: t.at("problem", "too"),
  falls: t.at("problem", "falls"),
  idea: t.at("idea"),
  more: t.at("idea", "more"),
  balancer: t.at("idea", "balancer"),
  route: t.at("route"),
  picks: t.at("route", "picks"),
  inside: t.at("inside"),
  list: t.at("inside", "list"),
  pointer: t.at("inside", "pointer"),
  turns: [t.at("roundrobin", "one"), t.at("roundrobin", "two"), t.at("roundrobin", "three"), t.at("roundrobin", "back")] as const,
  closes: t.at("failure") - 20,
  dies: t.at("failure", "dies"),
  pulls: t.at("failure", "pulls"),
  cost: t.at("cost"),
  spotlight: t.at("cost", "balancer"),
  down: t.at("cost", "down"),
};

const every = (from: number, to: number, step: number) => Array.from({ length: Math.max(0, Math.ceil((to - from) / step)) }, (_, i) => from + i * step);

// Before the balancer exists: requests go straight to Server B, slowly at first, then a flood.
const DIRECT_TRAVEL = 26;
const directStarts = [...every(6, cue.flood, 15), ...every(cue.flood, cue.falls + 12, 5)];

// With the balancer: client -> balancer -> a server, taking turns.
const LEG = 16;
const ROTATION = ["a", "b", "c"] as const;
const SURVIVORS = ["a", "c"] as const;
const firstTurn = cue.turns[0] - LEG;
const routedStarts = [
  ...every(cue.route, cue.inside - 10, 16),
  ...every(cue.inside, firstTurn - 12, 20),
  // Timed so a packet leaves the balancer on each of "one, two, three, back".
  ...cue.turns.map((turn) => turn - LEG),
  ...every(t.end("roundrobin") + 6, t.durationInFrames - 2 * LEG, 16),
];
const firstTurnIndex = routedStarts.indexOf(firstTurn);
const routed = routedStarts.map((start, index) => {
  const pulled = start + LEG >= cue.pulls;
  const turn = index - firstTurnIndex + ROTATION.length * routedStarts.length;
  const server = pulled ? SURVIVORS[index % SURVIVORS.length]! : ROTATION[turn % ROTATION.length]!;
  return { start, server, lost: server === "b" && start + 2 * LEG >= cue.dies };
});

const SLOTS = [-0.6, 0, 0.6] as const;

/** What is inside the balancer: one slot per server, and a pointer to whose turn it is. */
const Rotation = ({ frame }: { frame: number }) => {
  const [one, two, three, back] = cue.turns;
  const turn = ease(frame, two - 8, two) + ease(frame, three - 8, three) - 2 * ease(frame, back - 10, back);
  const pointerX = SLOTS[0] + turn * (SLOTS[1] - SLOTS[0]);
  const lit = [pulse(frame, one, 14) + pulse(frame, back, 14), pulse(frame, two, 14), pulse(frame, three, 14)];

  return (
    <>
      {SLOTS.map((x, index) => (
        <group key={x} position={[x, -0.3, 0]}>
          <mesh>
            <boxGeometry args={[0.44, 0.14, 0.44]} />
            <meshStandardMaterial color={theme.surface} emissive={theme.accent} emissiveIntensity={(0.12 + 1.1 * (lit[index] ?? 0)) * theme.glow} />
          </mesh>
          <Label position={[0, 0.12, 0]} size={0.17}>
            {["A", "B", "C"][index] ?? ""}
          </Label>
        </group>
      ))}
      <mesh position={[pointerX, 0.26, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.09, 0.2, 24]} />
        <meshStandardMaterial color={theme.text} emissive={theme.text} emissiveIntensity={0.8 * theme.glow} />
      </mesh>
    </>
  );
};

const CODE = `
const servers = ["A", "B", "C"];
let turn = 0;

function pick() {
  const server = servers[turn];
  turn = (turn + 1) % servers.length;
  return server;
}
`;

export const LoadBalancer = () => {
  const frame = useCurrentFrame();

  const overloaded = ease(frame, cue.flood, cue.falls) * (1 - ease(frame, cue.idea, cue.idea + 20));
  const dead = ease(frame, cue.dies, cue.dies + 10);
  const open = ease(frame, cue.inside - 5, cue.inside + 15) * (1 - ease(frame, cue.closes, cue.closes + 15));
  const wired = (delay: number) => ease(frame, cue.balancer + 8 + delay, cue.balancer + 24 + delay);
  const codeIn = ease(frame, cue.list - 8, cue.list + 6) * (1 - ease(frame, cue.closes - 5, cue.closes + 8));
  const codeLines = frame < cue.pointer ? [1] : frame < cue.turns[0] - 6 ? [2] : [5, 6];

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <CodePanel code={CODE} title="round robin" highlight={codeLines} appear={codeIn} />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: [client, serverB], azimuth: -12 },
          { at: cue.flood - 12, targets: [serverB], view: "close", azimuth: -30, padding: 1.35 },
          { at: cue.idea - 6, targets: everything, azimuth: 8 },
          { at: cue.route, targets: everything, azimuth: 24 },
          { at: cue.inside - 14, targets: [lb], view: "close", azimuth: 12, elevation: 30, shift: [-0.2, 0.04] },
          { at: cue.closes, targets: everything, azimuth: -18 },
          { at: cue.cost, targets: [lb], view: "close", azimuth: -28, padding: 1.5 },
        ]}
      />

      <Focus on={["lb"]} amount={ease(frame, cue.spotlight - 6, cue.spotlight + 12)}>
        <Pipe from={client} to={serverB} progress={1 - ease(frame, cue.balancer - 4, cue.balancer + 8)} />
        <Graph3D
          graph={graph}
          nodes={{
            lb: {
              appear: pop(frame, cue.balancer, FPS),
              active: Math.max(pulse(frame, cue.picks, 24), ease(frame, cue.down - 4, cue.down + 6)),
              tone: frame >= cue.cost ? "danger" : "accent",
              open,
              children: <Rotation frame={frame} />,
            },
            a: { appear: pop(frame, cue.more, FPS) },
            b: { active: Math.max(overloaded, dead), tone: "danger" },
            c: { appear: pop(frame, cue.more + 6, FPS) },
          }}
          edges={{
            "client->lb": wired(0),
            "lb->a": wired(6),
            "lb->b": wired(10) * (1 - ease(frame, cue.pulls, cue.pulls + 14)),
            "lb->c": wired(14),
          }}
        />
      </Focus>

      {directStarts.map((start) => (
        <Packet
          key={start}
          from={client}
          to={serverB}
          progress={ease(frame, start, start + DIRECT_TRAVEL)}
          tone={start + DIRECT_TRAVEL >= cue.falls ? "danger" : "accent"}
        />
      ))}
      {routed.map(({ start, server, lost }) => (
        <group key={start}>
          <Packet from={client} to={lb} progress={ease(frame, start, start + LEG)} />
          <Packet from={lb} to={graph.position(server)} progress={ease(frame, start + LEG, start + 2 * LEG)} tone={lost ? "danger" : "accent"} />
        </group>
      ))}
    </World>
  );
};
