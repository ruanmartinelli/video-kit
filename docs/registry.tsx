import type { ComponentType } from "react";
import type { z } from "zod";
import {
  cameraRigSchema,
  captionSchema,
  chipSchema,
  columnSchema,
  codePanelSchema,
  focusSchema,
  graphSpecSchema,
  labelSchema,
  nodeSchema,
  nodeShapeSchema,
  outcomeSchema,
  outcomesSchema,
  packetSchema,
  pipeSchema,
  linkSchema,
  shotSchema,
  tableSchema,
  tablesSchema,
} from "../src/kit";
import {
  CameraDemo,
  CAPTION_DEMO_FRAMES,
  CaptionDemo,
  ChangeDemo,
  CodePanelDemo,
  FocusDemo,
  GraphDemo,
  LabelDemo,
  NodeDemo,
  OutcomesDemo,
  PacketDemo,
  TablesDemo,
  WorldDemo,
} from "./demos";
import { ShapeGallery, shapeGalleryMeta } from "../src/gallery/ShapeGallery";

export type Control =
  | { key: string; kind: "select"; options: string[]; initial: string }
  | { key: string; kind: "range"; min: number; max: number; step: number; initial: number }
  | { key: string; kind: "text"; initial: string };

export type PropRow = { name: string; type: string; description: string };

export type Entry = {
  id: string;
  group: "Stage" | "Actors" | "Overlay";
  name: string;
  summary: string;
  code: string;
  // Demo props are the control values, so their exact shape is per demo.
  demo?: { component: ComponentType<any>; durationInFrames: number; controls?: Control[] };
  /** Props tables generated from Zod schemas. */
  schemas?: { title: string; schema: z.ZodType }[];
  /** Props that are not plain data, so they have no schema. */
  otherProps?: PropRow[];
};

export const entries: Entry[] = [
  {
    id: "world",
    group: "Stage",
    name: "World",
    summary:
      "The one 3D space a video happens in: floor, lights, fog. 3D things go in as children, flat things go in `overlay`. A video is one World, never a series of scenes.",
    demo: { component: WorldDemo, durationInFrames: 120 },
    otherProps: [
      { name: "children", type: "ReactNode", description: "3D content: actors and one CameraRig." },
      { name: "overlay", type: "ReactNode", description: "Flat content on top: Narration, Caption, CodePanel." },
    ],
    code: `<World overlay={<><Narration timeline={timeline} /><Caption timeline={timeline} /></>}>
  <CameraRig shots={shots} />
  <Graph3D graph={graph} />
</World>`,
  },
  {
    id: "camera-rig",
    group: "Stage",
    name: "CameraRig",
    summary:
      "The camera is the narrator. Give each shot the points to keep in frame and an angle; the rig works out where to stand and eases between shots.",
    demo: {
      component: CameraDemo,
      durationInFrames: 240,
      controls: [
        { key: "view", kind: "select", options: ["wide", "close", "low", "top"], initial: "close" },
        { key: "azimuth", kind: "range", min: -90, max: 90, step: 5, initial: 35 },
        { key: "sway", kind: "range", min: 0, max: 12, step: 1, initial: 3 },
      ],
    },
    schemas: [
      { title: "CameraRig", schema: cameraRigSchema },
      { title: "Shot", schema: shotSchema },
    ],
    code: `<CameraRig
  shots={[
    { at: 0, targets: everything },
    { at: t.at("inside"), targets: [graph.position("lb")], view: "close", azimuth: 12 },
    { at: t.at("failure"), targets: everything, azimuth: -18 },
  ]}
/>`,
  },
  {
    id: "timeline",
    group: "Stage",
    name: "Timeline",
    summary:
      "Turns narration into frame numbers. Every animation is keyed to a beat or to a word spoken inside one, never to a hand-picked frame. `pnpm narrate <video>` writes narration.json from script.json.",
    otherProps: [
      { name: "t.at(beat)", type: "number", description: "Frame the beat starts." },
      { name: "t.at(beat, word, occurrence?)", type: "number", description: "Frame `word` is spoken inside the beat. Throws if it is not there." },
      { name: "t.end(beat)", type: "number", description: "Frame the beat's audio ends." },
      { name: "t.durationInFrames", type: "number", description: "Length of the whole video." },
    ],
    code: `import narration from "./narration.json";

const t = createTimeline(narration, { fps: 30 });

<Node active={pulse(frame, t.at("route", "picks"))} />
<Packet progress={ease(frame, t.at("route"), t.at("route") + 16)} />`,
  },
  {
    id: "node",
    group: "Actors",
    name: "Node",
    summary:
      "A service, process or machine. It can pop into the scene, light up, and turn to glass to show what is inside it. Children are the internals, in the node's local space.",
    demo: {
      component: NodeDemo,
      durationInFrames: 220,
      controls: [
        { key: "label", kind: "text", initial: "Service" },
        { key: "shape", kind: "select", options: nodeShapeSchema.options, initial: "service" },
        { key: "tone", kind: "select", options: ["accent", "danger"], initial: "accent" },
      ],
    },
    schemas: [{ title: "Node", schema: nodeSchema }],
    otherProps: [{ name: "children", type: "ReactNode", description: "Internals. Only visible as `open` goes to 1. The box is 2 x 1.2 x 2." }],
    code: `<Node
  position={[0, NODE_HEIGHT / 2, 0]}
  label="Service"
  appear={pop(frame, 8)}
  active={pulse(frame, 55, 30)}
  open={ease(frame, 105, 125)}
>
  <Internals />
</Node>`,
  },
  {
    id: "shapes",
    group: "Actors",
    name: "Node shapes",
    summary:
      "What a Node looks like. Pick the shape that names the thing, so the viewer reads it before the label. All of them fit the same 2 x 1.2 x 2 box, so pipes, packets, the camera and `open` work the same on each.",
    demo: {
      component: ShapeGallery,
      durationInFrames: shapeGalleryMeta.durationInFrames,
      controls: [{ key: "tone", kind: "select", options: ["accent", "danger"], initial: "accent" }],
    },
    code: `<Node position={p} label="Orders DB" shape="database" />

const graph = layoutGraph({
  nodes: [
    { id: "web", label: "Web", shape: "client" },
    { id: "api", label: "API", shape: "server" },
    { id: "db", label: "Database", shape: "database" },
  ],
  edges: [["web", "api"], ["api", "db"]],
});`,
  },
  {
    id: "tables",
    group: "Overlay",
    name: "Tables",
    summary:
      "Database tables as flat panels over the scene: a name, then one row per column. Flat for the same reason as code: column names and types have to be read. Columns can slide in, carry what a PR did to them, and light up when a query touches them. In the 3D world the query is a packet reaching the database; pulse the row's `lit` on the frame it lands.",
    demo: {
      component: TablesDemo,
      durationInFrames: 200,
      controls: [
        { key: "direction", kind: "select", options: ["column", "row"], initial: "column" },
        { key: "side", kind: "select", options: ["right", "left"], initial: "right" },
      ],
    },
    schemas: [
      { title: "Tables", schema: tablesSchema },
      { title: "Table", schema: tableSchema },
      { title: "Column", schema: columnSchema },
      { title: "Link", schema: linkSchema },
    ],
    code: `const landed = t.at("read", "reads");

<World
  overlay={
    <Tables
      tables={[
        { name: "orders", columns: [
          { name: "id", type: "bigint pk" },
          { name: "refunded_at", type: "timestamptz", change: "added", lit: pulse(frame, landed) },
        ] },
        { name: "refunds", change: "added", appear: pop(frame, t.at("create")), columns: [...] },
      ]}
      links={[{ from: "refunds.order_id", to: "orders.id", tone: "added" }]}
    />
  }
>
  <Packet from={service} to={db} progress={ease(frame, landed - 14, landed)} />
</World>`,
  },
  {
    id: "outcomes",
    group: "Overlay",
    name: "Outcomes",
    summary:
      "For a PR that changes existing behaviour, like an auth check or a shared helper. The same cases are answered before and after, and a row whose answer changed turns red. In the 3D world each case is a labelled Packet sent through the changed node twice; fill the row on the frame the packet reaches it.",
    demo: {
      component: OutcomesDemo,
      durationInFrames: 220,
      controls: [{ key: "side", kind: "select", options: ["right", "left"], initial: "right" }],
    },
    schemas: [
      { title: "Outcomes", schema: outcomesSchema },
      { title: "Row", schema: outcomeSchema },
    ],
    code: `const before = t.at("base", "admin");
const after = t.at("replay", "admin");
const hit = (start) => start + 14;

<World
  overlay={
    <Outcomes
      rows={[{
        name: "admin, other tenant",
        before: "blocked",
        after: "passes",
        filled: ease(frame, hit(before) - 4, hit(before) + 6) + ease(frame, hit(after) - 4, hit(after) + 6),
      }]}
    />
  }
>
  <Packet from={client} to={guard} progress={ease(frame, before, hit(before))} label="admin, other tenant" />
  <Packet from={guard} to={client} progress={ease(frame, hit(before), hit(before) + 14)} label="admin, other tenant" />
  <Packet from={client} to={guard} progress={ease(frame, after, hit(after))} label="admin, other tenant" />
  <Packet from={guard} to={api} progress={ease(frame, hit(after), hit(after) + 14)} label="admin, other tenant" tone="danger" />
</World>`,
  },
  {
    id: "change",
    group: "Actors",
    name: "Change marks",
    summary:
      "For reviewing a PR. `change` on a Node, a Table or a column says what the PR did to it: green is added, amber is changed, red is removed. Leave it off everything the PR did not touch, so color means this PR. Chip names the file or migration on screen so the viewer can go find it.",
    demo: { component: ChangeDemo, durationInFrames: 120 },
    schemas: [{ title: "Chip", schema: chipSchema }],
    code: `const graph = layoutGraph({
  nodes: [
    { id: "router", label: "Router", change: "changed" },
    { id: "new", label: "RefundsController", change: "added" },
  ],
  edges: [["router", "new"]],
});

<World overlay={<Chip caption="new file" tone="added">src/controllers/refunds.ts</Chip>}>`,
  },
  {
    id: "packet",
    group: "Actors",
    name: "Packet + Pipe",
    summary:
      "The packet is the thing the viewer follows: a request, a message, a row. The pipe is the connection it travels along. Both take node centers and stop at the node's edge.",
    demo: {
      component: PacketDemo,
      durationInFrames: 120,
      controls: [
        { key: "tone", kind: "select", options: ["accent", "danger"], initial: "accent" },
        { key: "label", kind: "text", initial: "" },
      ],
    },
    schemas: [
      { title: "Packet", schema: packetSchema },
      { title: "Pipe", schema: pipeSchema },
    ],
    code: `<Pipe from={a} to={b} progress={ease(frame, 5, 30)} />
<Packet from={a} to={b} progress={ease(frame, 40, 85)} />`,
  },
  {
    id: "graph",
    group: "Actors",
    name: "Graph3D",
    summary:
      "Lays out nodes and pipes so nobody places coordinates by hand. `layoutGraph` runs first because the video needs the positions too, for packets and camera targets.",
    demo: {
      component: GraphDemo,
      durationInFrames: 150,
      controls: [
        { key: "columnGap", kind: "range", min: 4, max: 9, step: 0.5, initial: 6 },
        { key: "rowGap", kind: "range", min: 3, max: 8, step: 0.5, initial: 5 },
      ],
    },
    schemas: [{ title: "layoutGraph(spec)", schema: graphSpecSchema }],
    otherProps: [
      { name: "graph", type: "Graph", description: "What layoutGraph() returned." },
      { name: "nodes", type: "Record<id, NodeState>", description: "Per-node active, tone, appear, open, children." },
      { name: "edges", type: "Record<\"from->to\", number>", description: "Per-edge draw progress, 0 to 1." },
    ],
    code: `const graph = layoutGraph({
  nodes: [{ id: "lb", label: "Load balancer" }, { id: "a", label: "Server A" }],
  edges: [["lb", "a"]],
});

<Graph3D graph={graph} nodes={{ a: { active: pulse(frame, 40) } }} edges={{ "lb->a": ease(frame, 10, 30) }} />
<Packet from={graph.position("lb")} to={graph.position("a")} progress={ease(frame, 40, 56)} />`,
  },
  {
    id: "focus",
    group: "Actors",
    name: "Focus",
    summary: "Dims every actor inside it except the ones you name. Use it when the narration is about one thing.",
    demo: {
      component: FocusDemo,
      durationInFrames: 150,
      controls: [{ key: "on", kind: "select", options: ["api", "queue", "worker"], initial: "queue" }],
    },
    schemas: [{ title: "Focus", schema: focusSchema }],
    code: `<Focus on={["queue"]} amount={ease(frame, 25, 45)}>
  <Graph3D graph={graph} />
</Focus>`,
  },
  {
    id: "label",
    group: "Actors",
    name: "Label",
    summary:
      "Short text in the world that always faces the camera. All 3D text goes through this: it holds the render until the text is typeset, which raw drei <Text> does not.",
    demo: {
      component: LabelDemo,
      durationInFrames: 180,
      controls: [
        { key: "text", kind: "text", initial: "Always faces you" },
        { key: "size", kind: "range", min: 0.2, max: 0.8, step: 0.05, initial: 0.36 },
      ],
    },
    schemas: [{ title: "Label", schema: labelSchema }],
    code: `<Label position={[0, 1.4, 0]}>Always faces you</Label>`,
  },
  {
    id: "code-panel",
    group: "Overlay",
    name: "CodePanel",
    summary:
      "Highlighted code on a flat card, because code at an angle is unreadable. Spotlight lines as they are spoken, and shift the camera so the 3D subject sits on the other side.",
    demo: {
      component: CodePanelDemo,
      durationInFrames: 150,
      controls: [
        { key: "side", kind: "select", options: ["right", "left"], initial: "right" },
        { key: "title", kind: "text", initial: "round robin" },
      ],
    },
    schemas: [{ title: "CodePanel", schema: codePanelSchema }],
    code: `<World overlay={<CodePanel code={code} highlight={[5, 6]} appear={ease(frame, 5, 20)} />}>
  <CameraRig shots={[{ at: 0, targets: [lb], view: "close", shift: [-0.2, 0.04] }]} />
</World>`,
  },
  {
    id: "caption",
    group: "Overlay",
    name: "Caption + Narration",
    summary:
      "Caption shows the words of the current beat and lights each one as it is spoken. Narration plays each beat's audio at its place on the timeline. Both read the same Timeline.",
    demo: {
      component: CaptionDemo,
      durationInFrames: CAPTION_DEMO_FRAMES,
      controls: [{ key: "wordsPerLine", kind: "range", min: 3, max: 10, step: 1, initial: 7 }],
    },
    schemas: [{ title: "Caption", schema: captionSchema }],
    otherProps: [{ name: "timeline", type: "Timeline", description: "From createTimeline(). Required by both." }],
    code: `<World overlay={<><Narration timeline={t} /><Caption timeline={t} /></>}>`,
  },
];
