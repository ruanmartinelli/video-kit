import { useCurrentFrame } from "remotion";
import { CameraRig, ease, Graph3D, layoutGraph, pulse, World } from "../kit";
import { EventTimeline } from "../kit/EventTimeline";
import { Lifecycle } from "../kit/Lifecycle";
import { Meter } from "../kit/Meter";
import { Phases } from "../kit/Phases";
import { RecordCard } from "../kit/RecordCard";

/** Each panel gets its own stretch of the gallery, one at a time. */
const SEGMENTS = {
  stock: 0,
  timeLimit: 150,
  lifecycle: 270,
  timeline: 420,
  record: 570,
  phases: 690,
  end: 810,
};

export const panelGalleryMeta = { id: "PanelGallery", fps: 30, width: 1920, height: 1080, durationInFrames: SEGMENTS.end };

const graph = layoutGraph({
  nodes: [
    { id: "api", label: "Orders", shape: "server" },
    { id: "db", label: "Stock", shape: "database" },
  ],
  edges: [["api", "db"]],
});
const targets = graph.nodes.map((node) => node.position);

/** Scratch stage for looking at kit pieces while they are built. `pnpm stills PanelGallery`. */
export const PanelGallery = () => {
  const frame = useCurrentFrame();
  /** In over the first 10 frames of a segment, out over the last 10. */
  const shown = (from: number, to: number) => ease(frame, from, from + 10) * (1 - ease(frame, to - 10, to));
  const s = SEGMENTS;

  return (
    <World
      overlay={
        <>
          <Meter
            label="available"
            value={12 - 8 * ease(frame, 40, 70) - 3 * ease(frame, 90, 110)}
            max={20}
            limit={5}
            limitLabel="minimum"
            unit="units"
            appear={shown(s.stock, s.timeLimit)}
          />
          <Meter
            label="transaction open"
            value={9 * ease(frame, s.timeLimit + 15, s.timeLimit + 90)}
            max={10}
            limit={8}
            limitLabel="time limit"
            breach="above"
            unit="s"
            decimals={1}
            side="left"
            appear={shown(s.timeLimit, s.lifecycle)}
          />
          <Lifecycle
            title="order 1042"
            states={[
              { name: "Pending" },
              { name: "Paid" },
              { name: "Packed" },
              { name: "Shipped" },
              { name: "Delivered" },
              { name: "Canceled", tone: "danger" },
            ]}
            current={
              ease(frame, s.lifecycle + 30, s.lifecycle + 50) +
              ease(frame, s.lifecycle + 70, s.lifecycle + 90) +
              3 * ease(frame, s.lifecycle + 105, s.lifecycle + 135)
            }
            side="left"
            appear={shown(s.lifecycle, s.timeline)}
          />
          <EventTimeline
            title="sync_stock, order 1042"
            window={[8 * 60, 18 * 60]}
            ticks={[
              { at: 9 * 60, label: "09:00" },
              { at: 11 * 60, label: "11:00" },
              { at: 13 * 60, label: "13:00" },
              { at: 15 * 60, label: "15:00" },
              { at: 17 * 60, label: "17:00" },
            ]}
            events={[
              ...[8.5, 9.5, 10.5, 11.5, 12.5, 14.5, 15.5, 16.5, 17.5].map((hour) => ({ at: hour * 60 })),
              { at: 13 * 60 + 10, label: "stock changed", tone: "added" as const },
              { at: 13 * 60 + 25, label: "retry", tone: "danger" as const },
              { at: 13 * 60 + 40, label: "sync failed", tone: "danger" as const },
              { at: 17 * 60 + 50, label: "end of day", tone: "added" as const },
            ]}
            playhead={ease(frame, s.timeline + 15, s.timeline + 130)}
            legend={{ neutral: "wasted", added: "useful", danger: "failed" }}
            appear={shown(s.timeline, s.record)}
          />
          <RecordCard
            caption="record"
            title="order 1042"
            fields={[
              { name: "id", value: "1042" },
              { name: "status", value: "reserved", was: "pending", flip: ease(frame, s.record + 40, s.record + 60), lit: pulse(frame, s.record + 50, 40) },
              { name: "quantity", value: "3" },
              { name: "reserved_at", value: "13:10:42", was: "null", flip: ease(frame, s.record + 75, s.record + 95) },
              { name: "warehouse", value: "east-2" },
              { name: "updated_by", value: "sync_stock" },
            ]}
            side="left"
            appear={shown(s.record, s.phases)}
          />
          <Phases
            steps={["shadow", "compare", "move one", "migrate", "clean up", "remove old"]}
            current={ease(frame, s.phases + 25, s.phases + 40) + ease(frame, s.phases + 55, s.phases + 70) + ease(frame, s.phases + 85, s.phases + 100)}
            note={frame < s.phases + 70 ? "the old path keeps running" : "one warehouse reads from the new path"}
            appear={shown(s.phases, s.end)}
          />
        </>
      }
    >
      <CameraRig
        shots={[
          { at: 0, targets, padding: 1.6, shift: [-0.15, -0.1] },
          { at: s.timeLimit, targets, padding: 1.6, shift: [0.15, -0.1] },
          { at: s.lifecycle, targets, padding: 1.6, shift: [0, -0.25] },
          { at: s.timeline, targets, padding: 1.6, shift: [-0.2, -0.2] },
          { at: s.record, targets, padding: 1.6, shift: [0.15, -0.1] },
          { at: s.phases, targets, padding: 1.4, shift: [0, -0.2] },
        ]}
      />
      <Graph3D graph={graph} />
    </World>
  );
};
