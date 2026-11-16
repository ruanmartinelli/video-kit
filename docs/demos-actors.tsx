import { useCurrentFrame } from "remotion";
import { CameraRig, ease, Graph3D, layoutGraph, Node, NODE_HEIGHT, Packet, pulse, World, type Vec3 } from "../src/kit";
import { Callout } from "../src/kit/Callout";
import { Fan } from "../src/kit/Fan";
import { Gate, gatePoint } from "../src/kit/Gate";
import { NODE_CLEAR } from "../src/kit/geometry";

/** Demo scenes for Gate, Fan and Callout. Each takes the values of its controls as props, and ends where it started so it loops. */

const Y = NODE_HEIGHT / 2;
const pair = layoutGraph({
  nodes: [
    { id: "api", label: "Orders API" },
    { id: "stock", label: "Stock", shape: "database" },
  ],
  edges: [["api", "stock"]],
  columnGap: 7,
});
const left = pair.position("api");
const right = pair.position("stock");

/** One packet up to the gate, then on through it or back where it came from. */
const Checked = ({ frame, start, passes, label, gate }: { frame: number; start: number; passes: boolean; label: string; gate: Vec3 }) => {
  const reach = start + 25;
  // The second leg starts a frame early: a packet is hidden at exactly 0 and 1, so the handoff frame would show neither.
  const back = ease(frame, reach - 1, reach + 24);
  return (
    <>
      <Packet from={left} to={gate} clear={[NODE_CLEAR, 0]} progress={ease(frame, start, reach)} tone={passes ? "accent" : "danger"} label={label} />
      {passes ? (
        <Packet from={gate} to={right} clear={[0, NODE_CLEAR]} progress={back} tone="accent" label={label} />
      ) : (
        <Packet from={gate} to={left} clear={[0, NODE_CLEAR]} progress={back} tone="danger" label={label} />
      )}
    </>
  );
};

export const GateDemo = ({ rule, at }: { rule: string; at: number }) => {
  const frame = useCurrentFrame();
  const gate = gatePoint(left, right, at);
  const passAt = 40;
  const bounceAt = 100;
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [left, right], azimuth: 18, padding: 1.3 }]} />
      <Graph3D graph={pair} nodes={{ stock: { active: pulse(frame, passAt + 25), tone: "accent" } }} />
      <Gate
        from={left}
        to={right}
        at={at}
        rule={rule || undefined}
        active={Math.max(pulse(frame, passAt, 25), pulse(frame, bounceAt, 25))}
        tone={frame < bounceAt - 10 ? "accent" : "danger"}
      />
      <Checked frame={frame} start={passAt - 25} passes label="qty 2" gate={gate} />
      <Checked frame={frame} start={bounceAt - 25} passes={false} label="qty 50" gate={gate} />
    </World>
  );
};

const shards = ["Shard 1", "Shard 2", "Shard 3", "Shard 4"];

export const FanDemo = ({ direction, stagger, count }: { direction: "split" | "merge"; stagger: number; count: number }) => {
  const frame = useCurrentFrame();
  const names = shards.slice(0, count);
  const graph = layoutGraph({
    nodes: [{ id: "one", label: "Search", shape: "server" }, ...names.map((name) => ({ id: name, label: name, shape: "database" as const }))],
    edges: names.map((name) => ["one", name] as [string, string]),
    columnGap: 7,
    // Seen from above, the column has room for labels closer than the default gap.
    rowGap: 4.4,
  });
  const many = names.map((name) => graph.position(name));
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), elevation: 50, padding: 0.95 }]} />
      <Graph3D graph={graph} nodes={{ one: { active: pulse(frame, direction === "split" ? 12 : 80, 8), tone: "accent" } }} />
      <Fan from={graph.position("one")} to={many} direction={direction} stagger={stagger} progress={ease(frame, 12, 80)} tone="accent" />
    </World>
  );
};

export const CalloutDemo = ({ text, tone, right: across, up }: { text: string; tone: "neutral" | "accent" | "danger"; right: number; up: number }) => {
  const frame = useCurrentFrame();
  const at: Vec3 = [0, NODE_HEIGHT, 0];
  return (
    <World>
      <CameraRig shots={[{ at: 0, targets: [[0, Y, 0]], azimuth: 15, padding: 1.9 }]} />
      <Node
        position={[0, Y, 0]}
        label="Stock"
        shape="database"
        active={tone === "neutral" ? 0 : ease(frame, 25, 40) * (1 - ease(frame, 100, 115))}
        tone={tone === "danger" ? "danger" : "accent"}
      />
      {text ? (
        <Callout at={at} offset={[across, up]} tone={tone} appear={ease(frame, 10, 45) * (1 - ease(frame, 100, 115))}>
          {text}
        </Callout>
      ) : null}
    </World>
  );
};
