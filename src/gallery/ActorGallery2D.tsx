import { useCurrentFrame } from "remotion";
import { CameraRig, ease, Graph, layoutGraph, Packet, pop, pulse, World } from "../kit2d";
import { Callout } from "../kit2d";
import { Fan } from "../kit2d";
import { Gate, gatePoint } from "../kit2d";
import { NODE_CLEAR } from "../kit2d";

export const actorGallery2DMeta = { id: "ActorGallery2D", fps: 30, width: 1920, height: 1080, durationInFrames: 300 };

const graph = layoutGraph({
  nodes: [
    { id: "web", label: "Web", shape: "client" },
    { id: "api", label: "Orders API", shape: "server" },
    { id: "email", label: "Email", shape: "worker" },
    { id: "invoice", label: "Invoice", shape: "worker" },
    { id: "audit", label: "Audit", shape: "worker" },
  ],
  edges: [
    ["web", "api"],
    ["api", "email"],
    ["api", "invoice"],
    ["api", "audit"],
  ],
});

const web = graph.position("web");
const api = graph.position("api");
const workers = ["email", "invoice", "audit"].map((id) => graph.position(id));
const gate = gatePoint(web, api);

/** A packet checked at the gate: up to the ring, then on to `api` if it passes or back to `web` if not. */
const Checked = ({ frame, start, passes, label }: { frame: number; start: number; passes: boolean; label: string }) => {
  const reach = start + 25;
  return (
    <>
      <Packet from={web} to={gate} clear={[NODE_CLEAR, 0]} progress={ease(frame, start, reach)} tone={passes ? "accent" : "danger"} label={label} />
      {/* Starts a frame early: both legs are hidden on the frame one ends and the other begins. */}
      {passes ? (
        <Packet from={gate} to={api} clear={[0, NODE_CLEAR]} progress={ease(frame, reach - 1, reach + 24)} tone="accent" label={label} />
      ) : (
        <Packet from={gate} to={web} clear={[0, NODE_CLEAR]} progress={ease(frame, reach - 1, reach + 24)} tone="danger" label={label} />
      )}
    </>
  );
};

/** Scratch stage for the Gate, Fan and Callout actors. `pnpm stills ActorGallery2D`. */
export const ActorGallery2D = () => {
  const frame = useCurrentFrame();
  const passAt = 55;
  const bounceAt = 115;

  return (
    <World overlay={null}>
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position) }]} />
      <Graph graph={graph} nodes={{ api: { active: Math.max(pulse(frame, 80), pulse(frame, 255)), tone: "accent" } }} />
      <Gate
        from={web}
        to={api}
        rule="qty <= stock"
        appear={pop(frame, 8)}
        active={Math.max(pulse(frame, passAt, 25), pulse(frame, bounceAt, 25))}
        tone={frame < bounceAt - 10 ? "accent" : "danger"}
      />
      {/* A gate on a diagonal pipe: the ring still faces along it. */}
      <Gate from={api} to={graph.position("email")} at={0.45} rule="priority" appear={pop(frame, 14)} active={pulse(frame, 185, 25)} />
      <Checked frame={frame} start={30} passes label="qty 2" />
      <Checked frame={frame} start={90} passes={false} label="qty 50" />
      <Fan from={api} to={workers} progress={ease(frame, 150, 200)} stagger={0.5} tone="accent" />
      <Fan from={api} to={workers} direction="merge" progress={ease(frame, 210, 255)} />
      <Callout at={gate} offset={[-0.8, -1.8]} appear={ease(frame, 20, 50) * (1 - ease(frame, 135, 145))} tone="accent">
        checked per order
      </Callout>
      <Callout at={[api[0], api[1], api[2] + 1]} offset={[0.9, -2.2]} appear={ease(frame, 150, 185)}>
        one order, three jobs
      </Callout>
    </World>
  );
};
