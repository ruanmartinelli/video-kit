import { useCurrentFrame } from "remotion";
import { CameraRig, ease, Graph3D, layoutGraph, Packet, pulse, World, type Vec3 } from "../src/kit";
import { EventTimeline } from "../src/kit/EventTimeline";
import { Lifecycle } from "../src/kit/Lifecycle";
import { Meter } from "../src/kit/Meter";
import { Phases } from "../src/kit/Phases";
import { RecordCard } from "../src/kit/RecordCard";

/** Demo scenes for the five state panels. Each takes the values of its controls as props and loops cleanly. */

const orders = layoutGraph({
  nodes: [
    { id: "api", label: "Orders", shape: "server" },
    { id: "db", label: "Stock", shape: "database" },
  ],
  edges: [["api", "db"]],
});
const [api, db] = orders.nodes.map((node) => node.position) as [Vec3, Vec3];
const targets = orders.nodes.map((node) => node.position);

/** Panels sit on one side; push the 3D subject toward the other. */
const shiftFor = (side: "left" | "right", amount = 0.18, down = -0.12): [number, number] => [side === "right" ? -amount : amount, down];

/** In at the start, out at the end, so the Player's loop has no jump. */
const looped = (frame: number, duration: number) => ease(frame, 4, 16) * (1 - ease(frame, duration - 14, duration - 2));

export const LIFECYCLE_DEMO_FRAMES = 180;

export const LifecycleDemo = ({ side }: { side: "left" | "right" }) => {
  const frame = useCurrentFrame();
  const moves = [30, 65, 100];
  const current = moves.reduce((sum, at) => sum + ease(frame, at, at + 18), 0);
  return (
    <World
      overlay={
        <Lifecycle
          title="order 1042"
          states={[{ name: "Pending" }, { name: "Paid" }, { name: "Shipped" }, { name: "Delivered" }]}
          current={current}
          side={side}
          appear={looped(frame, LIFECYCLE_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets, padding: 1.5, shift: [0, -0.25] }]} />
      <Graph3D graph={orders} nodes={{ api: { active: Math.max(...moves.map((at) => pulse(frame, at + 9, 24))) } }} />
    </World>
  );
};

export const METER_DEMO_FRAMES = 150;

export const MeterDemo = ({ side, breach }: { side: "left" | "right"; breach: string }) => {
  const frame = useCurrentFrame();
  const above = breach === "above";
  const fill = ease(frame, 20, 60) * 0.5 + ease(frame, 75, 105) * 0.5;
  return (
    <World
      overlay={
        above ? (
          <Meter
            label="transaction open"
            value={9 * fill}
            max={10}
            limit={8}
            limitLabel="time limit"
            breach="above"
            unit="s"
            decimals={1}
            side={side}
            appear={looped(frame, METER_DEMO_FRAMES)}
          />
        ) : (
          <Meter
            label="available"
            value={12 - 9 * fill}
            max={20}
            limit={5}
            limitLabel="minimum"
            unit="units"
            side={side}
            appear={looped(frame, METER_DEMO_FRAMES)}
          />
        )
      }
    >
      <CameraRig shots={[{ at: 0, targets, padding: 1.5, shift: shiftFor(side) }]} />
      <Graph3D graph={orders} nodes={{ db: { active: pulse(frame, 95, 30), tone: "danger" } }} />
    </World>
  );
};

export const EVENT_TIMELINE_DEMO_FRAMES = 200;

export const EventTimelineDemo = ({ side }: { side: "left" | "right" }) => {
  const frame = useCurrentFrame();
  const hour = 60;
  return (
    <World
      overlay={
        <EventTimeline
          title="sync_stock, order 1042"
          window={[8 * hour, 18 * hour]}
          ticks={[9, 11, 13, 15, 17].map((h) => ({ at: h * hour, label: `${String(h).padStart(2, "0")}:00` }))}
          events={[
            ...[8.5, 9.5, 10.5, 11.5, 12.5, 14.5, 15.5, 16.5, 17.5].map((h) => ({ at: h * hour })),
            { at: 13 * hour + 10, label: "stock changed", tone: "added" as const },
            { at: 13 * hour + 40, label: "sync failed", tone: "danger" as const },
          ]}
          playhead={ease(frame, 20, 170)}
          legend={{ neutral: "wasted", added: "useful", danger: "failed" }}
          side={side}
          appear={looped(frame, EVENT_TIMELINE_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets, padding: 2.1, shift: shiftFor(side, 0.24, -0.3) }]} />
      <Graph3D graph={orders} />
    </World>
  );
};

export const RECORD_CARD_DEMO_FRAMES = 150;

export const RecordCardDemo = ({ side }: { side: "left" | "right" }) => {
  const frame = useCurrentFrame();
  // The write lands on the database at frame 50; the field flips on that frame.
  const lands = 50;
  return (
    <World
      overlay={
        <RecordCard
          caption="record"
          title="order 1042"
          fields={[
            { name: "id", value: "1042" },
            { name: "status", value: "reserved", was: "pending", flip: ease(frame, lands, lands + 16), lit: pulse(frame, lands + 4, 40) },
            { name: "quantity", value: "3" },
            { name: "reserved_at", value: "13:10:42", was: "null", flip: ease(frame, lands + 20, lands + 36) },
          ]}
          side={side}
          appear={looped(frame, RECORD_CARD_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets, padding: 1.5, shift: shiftFor(side) }]} />
      <Graph3D graph={orders} nodes={{ db: { active: pulse(frame, lands, 30) } }} />
      <Packet from={api} to={db} progress={ease(frame, 24, lands)} label="UPDATE" />
    </World>
  );
};

export const PHASES_DEMO_FRAMES = 180;

const rollout = ["shadow", "compare", "move one", "migrate", "clean up", "remove old"];
const notes = [
  "the old path keeps running",
  "both paths answer, results compared",
  "one warehouse reads from the new path",
  "every warehouse moves over",
  "drop the copy job",
  "delete the old path",
];

export const PhasesDemo = ({ steps }: { steps: number }) => {
  const frame = useCurrentFrame();
  const count = Math.min(6, Math.max(2, Math.round(steps)));
  const step = (PHASES_DEMO_FRAMES - 50) / count;
  const current = Array.from({ length: count }, (_, index) => ease(frame, 20 + index * step, 32 + index * step)).reduce((a, b) => a + b, 0);
  return (
    <World
      overlay={
        <Phases
          steps={rollout.slice(0, count)}
          current={current}
          note={current < count ? notes[Math.floor(current)] : "done"}
          appear={looped(frame, PHASES_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets, padding: 1.4, shift: [0, -0.22] }]} />
      <Graph3D graph={orders} />
    </World>
  );
};
