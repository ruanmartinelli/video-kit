import { useCurrentFrame } from "remotion";
import { between, CameraRig, Caption, Chip, CodePanel, createTimeline, Focus, Graph3D, hop, layoutGraph, Narration, Packet, pulse, World } from "video-kit";
import narration from "./narration.json";

const FPS = 30;

// The timeline turns the narration into frame numbers. Everything below is timed from it.
export const timeline = createTimeline(narration, { fps: FPS });

export const templateMeta = { id: "Template", fps: FPS, width: 1920, height: 1080, durationInFrames: timeline.durationInFrames };

// Positions come from the layout. Packets, pipes and camera targets all read them from the graph.
const graph = layoutGraph({
  nodes: [
    { id: "app", label: "App", shape: "phone" },
    { id: "api", label: "Service", shape: "server" },
    { id: "db", label: "Database", shape: "database" },
  ],
  edges: [
    ["app", "api"],
    ["api", "db"],
  ],
});
const at = (id: string) => graph.position(id);
const everything = graph.nodes.map((node) => node.position);

// Every moment the video reacts to, named once: the start of a beat, or a word spoken inside it.
const t = timeline;
const cue = {
  request: t.at("ask", "request"),
  reads: t.at("read", "reads"),
  code: t.at("code"),
  line: t.at("code", "line"),
};

const CODE = `
const order = await db.orders.find(id);
return respond(order);
`;

export const Template = () => {
  const frame = useCurrentFrame();
  // A panel is on screen between two cues. The shot that shares the frame with it names its side.
  const codeIn = between(frame, cue.code, t.durationInFrames + 20);

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="file" appear={codeIn}>
            src/orders/show.ts
          </Chip>
          <CodePanel code={CODE} title="show.ts" highlight={frame < cue.line ? [] : [1]} appear={codeIn} />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: everything },
          { at: cue.code - 8, targets: [at("api")], view: "close", azimuth: -24, padding: 1.5, panel: "right" },
        ]}
      />

      {/* A node lights on the frame something reaches it. While the code is up, everything but its subject dims. */}
      <Focus on={["api"]} amount={codeIn}>
        <Graph3D graph={graph} nodes={{ api: { active: pulse(frame, cue.request + 14, 24) }, db: { active: pulse(frame, cue.reads + 14, 24) } }} />
      </Focus>

      {/* One hop per packet: it leaves at a cue and arrives 14 frames later. */}
      <Packet from={at("app")} to={at("api")} progress={hop(frame, cue.request)} label="GET /orders/7" />
      <Packet from={at("api")} to={at("db")} progress={hop(frame, cue.reads)} tone="accent" />
    </World>
  );
};
