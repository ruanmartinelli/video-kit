import type { ComponentType } from "react";
import type { z } from "zod";
import {
  barSchema,
  barsSchema,
  chapterSchema,
  chatMessageSchema,
  chatSchema,
  highlightSchema,
  proportionSchema,
  screenshotSchema,
  termSchema,
  eventTimelineSchema,
  lifecycleSchema,
  lifecycleStateSchema,
  meterSchema,
  phasesSchema,
  recordCardSchema,
  recordFieldSchema,
  timelineEventSchema,
  timelineTickSchema,
  calloutSchema,
  fanSchema,
  gateSchema,
  cameraRigSchema,
  captionSchema,
  chipSchema,
  columnSchema,
  codePanelSchema,
  focusSchema,
  graphSpecSchema,
  hubSpecSchema,
  lanesSchema,
  manifestItemSchema,
  manifestSchema,
  labelSchema,
  nodeSchema,
  nodeShapeSchema,
  outcomeSchema,
  outcomesSchema,
  packetSchema,
  pipeSchema,
  rippleSchema,
  scheduleRowSchema,
  scheduleSchema,
  linkSchema,
  shotSchema,
  storyboardPanelSchema,
  storyboardSchema,
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
  HubDemo,
  LabelDemo,
  LanesDemo,
  ManifestDemo,
  NodeDemo,
  OutcomesDemo,
  PacketDemo,
  ScheduleDemo,
  TablesDemo,
  WorldDemo,
} from "./demos";
import { CalloutDemo, FanDemo, GateDemo } from "./demos-actors";
import { BarsDemo, ChapterDemo, ChatDemo, ProportionDemo, ScreenshotDemo, TermDemo } from "./demos-overlays";
import { EventTimelineDemo, LifecycleDemo, MeterDemo, PhasesDemo, RecordCardDemo } from "./demos-panels";
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
      "The camera is the narrator. Give each shot the points to keep in frame and an angle; the rig works out where to stand and eases between shots. When a docked panel is on screen, name its side in `panel` and the rig fits the targets into the rest of the frame. Give it the `graph` and it refuses a shot where two node labels overlap.",
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
    otherProps: [
      {
        name: "graph",
        type: "Graph | Graph[]",
        description:
          "The graph on stage. With it the rig checks every shot once the camera has settled: two node labels overlapping throws, and the error says what to change.",
      },
    ],
    code: `<CameraRig
  graph={graph}
  shots={[
    { at: 0, targets: everything },
    { at: t.at("inside"), targets: [graph.position("lb")], view: "close", azimuth: 12 },
    // A CodePanel is on the right from here: the rig keeps the balancer clear of it.
    { at: t.at("code"), targets: [graph.position("lb")], view: "close", panel: "right" },
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
    id: "storyboard",
    group: "Stage",
    name: "Storyboard",
    summary:
      "A few frames of a finished video on one sheet, for presenting it yourself. The board is data: the video's composition id and a frame and a note per panel. Register `Storyboard` as a composition with the board as its props, then `pnpm storyboard <Id>` writes `out/storyboard/<Id>.png` and `<Id>-notes.png`: the same sheet, clean and with what to say under each panel.",
    schemas: [
      { title: "Storyboard", schema: storyboardSchema },
      { title: "Panel", schema: storyboardPanelSchema },
    ],
    code: `// src/videos/load-balancer/board.ts
export const loadBalancerBoard: StoryboardProps = {
  video: loadBalancerMeta.id,
  panels: [
    { frame: t.at("problem", "falls") + 10, note: "One server takes every request. Past its limit, it falls over." },
    { frame: t.at("route", "picks") + 12, note: "With a balancer in front, every request stops there first." },
  ],
};
export const loadBalancerBoardMeta = storyboardMeta("LoadBalancerBoard", loadBalancerBoard);

// src/Root.tsx
<Composition component={Storyboard} {...loadBalancerBoardMeta} defaultProps={loadBalancerBoard} />`,
  },
  {
    id: "node",
    group: "Actors",
    name: "Node",
    summary:
      "A service, process or machine. It can pop into the scene, light up, carry a badge for the state it is in, and turn to glass to show what is inside it. Children are the internals, in the node's local space.",
    demo: {
      component: NodeDemo,
      durationInFrames: 220,
      controls: [
        { key: "label", kind: "text", initial: "Service" },
        { key: "shape", kind: "select", options: nodeShapeSchema.options, initial: "service" },
        { key: "tone", kind: "select", options: ["accent", "danger"], initial: "accent" },
        { key: "badge", kind: "select", options: ["none", "locked", "syncing", "failed", "done"], initial: "none" },
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
      "What a Node looks like. Pick the shape that names the thing, so the viewer reads it before the label. All of them fit the same 2 x 1.2 x 2 box, so pipes, packets, the camera and `open` work the same on each. For systems: `database`, `server`, `queue`, `client` (a screen), `phone`, `user`, `cloud` (the internet), `external` (a system someone else runs), `storage` (files), `log` (an append-only record), `clock` (a schedule), `notification` (an email, an alert). For code: `router`, `controller`, `worker` (a job), `trigger` (code that runs because something else happened), `agent` (an automation or assistant), `model` (the LLM it calls), `file` (any module), `shield` (a check every request passes), `key` (a credential). `service` is the plain box.",
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
    id: "schedule",
    group: "Overlay",
    name: "Schedule",
    summary:
      "When a job runs, as ticks on a strip of time. Put the old and the new interval on the same clock and a schedule change stops being two numbers: it is six runs against seventy-two.",
    demo: {
      component: ScheduleDemo,
      durationInFrames: 190,
      controls: [{ key: "side", kind: "select", options: ["right", "left"], initial: "right" }],
    },
    schemas: [
      { title: "Schedule", schema: scheduleSchema },
      { title: "Row", schema: scheduleRowSchema },
    ],
    code: `<Schedule
  title="sync_usage"
  rows={[
    { label: "before", everyMinutes: 60, progress: ease(frame, t.at("schedule", "hour") - 20, t.at("schedule", "hour") + 20) },
    { label: "after", everyMinutes: 5, tone: "changed", progress: ease(frame, t.at("schedule", "five"), t.at("schedule", "five") + 50) },
  ]}
/>`,
  },
  {
    id: "lifecycle",
    group: "Overlay",
    name: "Lifecycle",
    summary:
      "The states a record moves through, in a row, with the current one lit and a marker that travels between them. Use it when the story is about one record changing state: an order, a job, a sync. It is a straight line; a flow that branches is a graph.",
    demo: { component: LifecycleDemo, durationInFrames: 180, controls: [{ key: "side", kind: "select", options: ["right", "left"], initial: "right" }] },
    schemas: [
      { title: "Lifecycle", schema: lifecycleSchema },
      { title: "State", schema: lifecycleStateSchema },
    ],
    code: `<Lifecycle
  title="order 1042"
  states={[{ name: "Pending" }, { name: "Paid" }, { name: "Shipped" }, { name: "Canceled", tone: "danger" }]}
  current={ease(frame, t.at("paid"), t.at("paid") + 18) + ease(frame, t.at("shipped"), t.at("shipped") + 18)}
/>`,
  },
  {
    id: "meter",
    group: "Overlay",
    name: "Meter",
    summary:
      "A value moving against a limit: stock crossing its minimum, a transaction filling toward its time cap, a queue backing up. Drive `value` from the frame. The bar and the number turn red on the wrong side of `limit`.",
    demo: {
      component: MeterDemo,
      durationInFrames: 150,
      controls: [
        { key: "side", kind: "select", options: ["right", "left"], initial: "right" },
        { key: "breach", kind: "select", options: ["below", "above"], initial: "below" },
      ],
    },
    schemas: [{ title: "Meter", schema: meterSchema }],
    code: `<Meter label="available" value={12 - 9 * ease(frame, t.at("sold"), t.at("sold") + 40)} max={20} limit={5} limitLabel="minimum" unit="units" />

<Meter label="transaction open" value={9 * ease(frame, start, start + 90)} max={10} limit={8} limitLabel="time limit" breach="above" unit="s" decimals={1} />`,
  },
  {
    id: "event-timeline",
    group: "Overlay",
    name: "EventTimeline",
    summary:
      "What happened to one thing over a stretch of time: irregular events on an axis, with a playhead. Each event is plain, useful or failed, and a count line keeps score as the playhead passes them. Schedule is for a fixed interval; this is for a real day.",
    demo: { component: EventTimelineDemo, durationInFrames: 200, controls: [{ key: "side", kind: "select", options: ["right", "left"], initial: "right" }] },
    schemas: [
      { title: "EventTimeline", schema: eventTimelineSchema },
      { title: "Event", schema: timelineEventSchema },
      { title: "Tick", schema: timelineTickSchema },
    ],
    code: `<EventTimeline
  title="sync_stock, order 1042"
  window={[8 * 60, 18 * 60]}
  ticks={[{ at: 9 * 60, label: "09:00" }, { at: 13 * 60, label: "13:00" }, { at: 17 * 60, label: "17:00" }]}
  events={[...hourly.map((hour) => ({ at: hour * 60 })), { at: 790, label: "stock changed", tone: "added" }]}
  playhead={ease(frame, t.at("day"), t.at("day") + 150)}
  legend={{ neutral: "wasted", added: "useful", danger: "failed" }}
/>`,
  },
  {
    id: "record-card",
    group: "Overlay",
    name: "RecordCard",
    summary:
      "One record as a card whose field flips from its old value to its new one. Also the payload an event carries. Flip the field on the frame the packet that writes it lands. Tables is for schema and many rows; this is for the one row the story follows.",
    demo: { component: RecordCardDemo, durationInFrames: 150, controls: [{ key: "side", kind: "select", options: ["right", "left"], initial: "right" }] },
    schemas: [
      { title: "RecordCard", schema: recordCardSchema },
      { title: "Field", schema: recordFieldSchema },
    ],
    code: `<RecordCard
  caption="record"
  title="order 1042"
  fields={[
    { name: "id", value: "1042" },
    { name: "status", value: "reserved", was: "pending", flip: ease(frame, lands, lands + 16), lit: pulse(frame, lands, 40) },
  ]}
/>`,
  },
  {
    id: "phases",
    group: "Overlay",
    name: "Phases",
    summary:
      "A rollout as a strip of steps: the ones done are checked, the current one is lit. For a plan or a migration, where the viewer needs to know where in the sequence the video is.",
    demo: { component: PhasesDemo, durationInFrames: 180, controls: [{ key: "steps", kind: "range", min: 2, max: 6, step: 1, initial: 4 }] },
    schemas: [{ title: "Phases", schema: phasesSchema }],
    code: `<Phases
  steps={["shadow", "compare", "move one", "migrate"]}
  current={ease(frame, t.at("compare"), t.at("compare") + 12) + ease(frame, t.at("move"), t.at("move") + 12)}
  note="the old path keeps running"
/>`,
  },
  {
    id: "proportion",
    group: "Overlay",
    name: "Proportion",
    summary:
      "A share as a grid of dots: 33 of 100, 7 of 128. For the moment a number is the point and the viewer should feel its size. The filled dots come in one by one with `progress`.",
    demo: {
      component: ProportionDemo,
      durationInFrames: 150,
      controls: [
        { key: "side", kind: "select", options: ["right", "left"], initial: "right" },
        { key: "part", kind: "range", min: 0, max: 100, step: 1, initial: 33 },
        { key: "tone", kind: "select", options: ["accent", "danger", "added"], initial: "accent" },
      ],
    },
    schemas: [{ title: "Proportion", schema: proportionSchema }],
    code: `<Proportion part={33} total={100} label="orders have a tracking number" progress={ease(frame, t.at("share"), t.at("share") + 40)} />`,
  },
  {
    id: "bars",
    group: "Overlay",
    name: "Bars",
    summary:
      "A few values as bars drawn to scale from a shared zero: before and after, cold and warm. Two to six bars. More than that is a chart, and a chart is a still image.",
    demo: {
      component: BarsDemo,
      durationInFrames: 150,
      controls: [
        { key: "side", kind: "select", options: ["left", "right"], initial: "left" },
        { key: "after", kind: "range", min: 0, max: 80, step: 1, initial: 3 },
      ],
    },
    schemas: [
      { title: "Bars", schema: barsSchema },
      { title: "Bar", schema: barSchema },
    ],
    code: `<Bars
  title="lines in reserveStock()"
  unit="lines"
  bars={[{ label: "before", value: 40 }, { label: "after", value: 3, tone: "changed" }]}
  progress={ease(frame, t.at("shorter"), t.at("shorter") + 50)}
  side="left"
/>`,
  },
  {
    id: "chat",
    group: "Overlay",
    name: "Chat",
    summary:
      "Message bubbles that type, for anything where someone asks an assistant: a support bot, a coding agent, a prompt and its answer. Up to four messages. `pending` shows the assistant thinking before its text starts.",
    demo: {
      component: ChatDemo,
      durationInFrames: 210,
      controls: [
        { key: "side", kind: "select", options: ["right", "left"], initial: "right" },
        { key: "question", kind: "text", initial: "Why did order #1040 ship late?" },
      ],
    },
    schemas: [
      { title: "Chat", schema: chatSchema },
      { title: "Message", schema: chatMessageSchema },
    ],
    code: `const answers = t.at("answer");

<Chat
  messages={[
    { from: "user", text: "Why did order #1040 ship late?", typed: ease(frame, t.at("ask"), t.at("ask") + 30) },
    // \`typed\` 0 hides a message, so keep it just above 0 once the dots are replaced by text.
    { from: "assistant", text: "The stock job retried three times.", pending: frame < answers, typed: Math.max(0.01, ease(frame, answers, answers + 50)) },
  ]}
/>`,
  },
  {
    id: "term",
    group: "Overlay",
    name: "Term",
    summary:
      "A word and its one-line meaning, pinned in a corner while the thing it names is on screen. For a viewer who is new to the codebase or the domain. One term at a time, and take it away when the narration moves on.",
    demo: {
      component: TermDemo,
      durationInFrames: 120,
      controls: [
        { key: "corner", kind: "select", options: ["bottom-left", "bottom-right"], initial: "bottom-left" },
        { key: "term", kind: "text", initial: "idempotent" },
        { key: "meaning", kind: "text", initial: "safe to run twice, same result" },
      ],
    },
    schemas: [{ title: "Term", schema: termSchema }],
    code: `<Term term="idempotent" meaning="safe to run twice, same result" appear={between(t.at("retry", "idempotent"), t.at("next"))} />`,
  },
  {
    id: "chapter",
    group: "Overlay",
    name: "Chapter",
    summary:
      "For a video longer than a few minutes: a title card when a chapter starts, and a thin rail along the bottom that shows how far in the viewer is. The rail stays on screen; pass `appear={0}` between cards.",
    demo: { component: ChapterDemo, durationInFrames: 180, controls: [{ key: "chapters", kind: "range", min: 2, max: 8, step: 1, initial: 5 }] },
    schemas: [{ title: "Chapter", schema: chapterSchema }],
    code: `const starts = [t.at("orders"), t.at("stock"), t.at("cost")];
const current = starts.findLastIndex((start) => start <= frame);

<Chapter
  titles={["Where orders come from", "Reserving stock", "What it costs"]}
  current={current}
  appear={ease(frame, starts[current], starts[current] + 10) * (1 - ease(frame, starts[current] + 50, starts[current] + 62))}
/>`,
  },
  {
    id: "screenshot",
    group: "Overlay",
    name: "Screenshot",
    summary:
      "An app screen in a browser frame, for the part of a story that happens in the UI. Outline what the narration is about with `highlight`, and sweep from the old screen to the new one with `wipe`. Images live under `public/`.",
    demo: {
      component: ScreenshotDemo,
      durationInFrames: 210,
      controls: [
        { key: "side", kind: "select", options: ["center", "left", "right"], initial: "center" },
        { key: "width", kind: "range", min: 400, max: 1100, step: 50, initial: 1100 },
      ],
    },
    schemas: [
      { title: "Screenshot", schema: screenshotSchema },
      { title: "Highlight", schema: highlightSchema },
    ],
    code: `<Screenshot
  src="demo/app-before.svg"
  after="demo/app-after.svg"
  url="admin.example.com/orders"
  wipe={ease(frame, t.at("after"), t.at("after") + 45)}
  highlight={{ x: 0.815, y: 0.285, width: 0.165, height: 0.086, appear: ease(frame, t.at("export"), t.at("export") + 14) }}
  appear={ease(frame, 4, 16)}
/>`,
  },
  {
    id: "manifest",
    group: "Overlay",
    name: "Manifest",
    summary:
      "The opening card of a PR review that covers more than one thing: every item, in the order the video covers them, and a line for what it leaves out. Bring it back between sections with `current` set, so the viewer knows where they are.",
    demo: {
      component: ManifestDemo,
      durationInFrames: 120,
      controls: [{ key: "current", kind: "select", options: ["none", "0", "1", "2", "3"], initial: "none" }],
    },
    schemas: [
      { title: "Manifest", schema: manifestSchema },
      { title: "Item", schema: manifestItemSchema },
    ],
    code: `<Manifest
  items={[
    { kind: "Auth", name: "requireAdmin", change: "changed", note: "existing policy changed" },
    { kind: "New endpoint", name: "GET /invoices/export", change: "added" },
  ]}
  footer="31 other files: ordinary changes, not shown"
  appear={1 - ease(frame, t.at("auth") - 12, t.at("auth"))}
/>`,
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
        { key: "pipeLabel", kind: "text", initial: "" },
      ],
    },
    schemas: [
      { title: "Packet", schema: packetSchema },
      { title: "Pipe", schema: pipeSchema },
    ],
    code: `<Pipe from={a} to={b} progress={ease(frame, 5, 30)} label="POST /orders" />
<Packet from={a} to={b} progress={ease(frame, 40, 85)} label="order 42" />`,
  },
  {
    id: "gate",
    group: "Actors",
    name: "Gate",
    summary:
      "A condition drawn on the connection itself: a ring the pipe runs through, with its rule above it. A packet that matches goes on through; one that does not travels back to where it came from. Use it for a trigger condition, a filter or a guard that is one line of code and not worth a node. A packet stops at `gatePoint()`, then a second packet carries on or returns.",
    demo: {
      component: GateDemo,
      durationInFrames: 150,
      controls: [
        { key: "rule", kind: "text", initial: "qty <= stock" },
        { key: "at", kind: "range", min: 0.25, max: 0.75, step: 0.05, initial: 0.5 },
      ],
    },
    schemas: [{ title: "Gate", schema: gateSchema }],
    otherProps: [
      {
        name: "gatePoint(from, to, at?)",
        type: "Vec3",
        description: "The ring's center. Send a Packet to it with `clear={[NODE_CLEAR, 0]}`, and on from it with `clear={[0, NODE_CLEAR]}`.",
      },
    ],
    code: `const gate = gatePoint(api, stock);
const reach = t.at("check", "stock"); // the frame the packet is at the ring

<Pipe from={api} to={stock} />
<Gate from={api} to={stock} rule="qty <= stock" active={pulse(frame, reach, 25)} tone={passes ? "accent" : "danger"} />
<Packet from={api} to={gate} clear={[NODE_CLEAR, 0]} progress={ease(frame, reach - 25, reach)} label="qty 2" />
{/* One frame early: a Packet is hidden at exactly 0 and 1. */}
<Packet from={gate} to={passes ? stock : api} clear={[0, NODE_CLEAR]} progress={ease(frame, reach - 1, reach + 24)} tone={passes ? "accent" : "danger"} label="qty 2" />`,
  },
  {
    id: "fan",
    group: "Actors",
    name: "Fan",
    summary:
      "One thing becomes many, or many collapse into one: a request fanned out to shards, a batch split into jobs, duplicates merged into one record. One small packet per target, all driven by a single `progress`.",
    demo: {
      component: FanDemo,
      durationInFrames: 90,
      controls: [
        { key: "direction", kind: "select", options: ["split", "merge"], initial: "split" },
        { key: "stagger", kind: "range", min: 0, max: 1, step: 0.1, initial: 0.3 },
        { key: "count", kind: "range", min: 2, max: 4, step: 1, initial: 4 },
      ],
    },
    schemas: [{ title: "Fan", schema: fanSchema }],
    code: `<Fan
  from={graph.position("search")}
  to={shards.map((id) => graph.position(id))}
  direction="split"
  stagger={0.3}
  progress={ease(frame, t.at("fanout"), t.at("fanout") + 60)}
  tone="accent"
/>`,
  },
  {
    id: "callout",
    group: "Actors",
    name: "Callout",
    summary:
      "A note tied to a point in the world by a leader line, for the one thing in the shot the narration is about. It faces the camera and draws over whatever is behind it. One at a time: two callouts in a shot is a diagram.",
    demo: {
      component: CalloutDemo,
      durationInFrames: 130,
      controls: [
        { key: "text", kind: "text", initial: "reads stale stock" },
        { key: "tone", kind: "select", options: ["neutral", "accent", "danger"], initial: "danger" },
        { key: "right", kind: "range", min: -3, max: 3, step: 0.2, initial: 2 },
        { key: "up", kind: "range", min: -2.4, max: 2.4, step: 0.2, initial: 1.2 },
      ],
    },
    schemas: [{ title: "Callout", schema: calloutSchema }],
    code: `<Callout at={graph.position("cache")} offset={[2, 1.2]} tone="danger" appear={ease(frame, t.at("stale"), t.at("stale") + 30)}>
  reads stale stock
</Callout>`,
  },
  {
    id: "hub",
    group: "Actors",
    name: "layoutHub + Ripple",
    summary:
      "For something many things depend on: a shared helper, a table, a core service. `layoutHub` puts it in the middle with its dependents around it and returns the same Graph as `layoutGraph`. `Ripple` spreads from it across the floor; light each dependent as the front reaches it.",
    demo: {
      component: HubDemo,
      durationInFrames: 150,
      controls: [{ key: "callers", kind: "range", min: 4, max: 10, step: 1, initial: 8 }],
    },
    schemas: [
      { title: "layoutHub(spec)", schema: hubSpecSchema },
      { title: "Ripple", schema: rippleSchema },
    ],
    code: `const graph = layoutHub({
  hub: { id: "helper", label: "formatMoney()", shape: "file", change: "changed" },
  spokes: callers.map((name) => ({ id: name, label: name, shape: "file" })),
});

// The front moves at a steady pace: it is at a spoke 85% of the way through.
const start = t.at("outside");
const progress = Math.min(1, Math.max(0, (frame - start) / 60));

<Ripple at={graph.position("helper")} progress={progress} />
const hit = start + 51;
<Graph3D graph={graph} nodes={{ PayoutExport: { active: ease(frame, hit - 4, hit + 8), tone: frame >= hit - 4 ? "danger" : "accent" } }} />`,
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
      {
        name: "edges",
        type: 'Record<"from->to", number | { progress, tone, label }>',
        description: "Per-edge draw progress, 0 to 1, or the pipe's progress, tone and label.",
      },
    ],
    code: `const graph = layoutGraph({
  nodes: [{ id: "lb", label: "Load balancer" }, { id: "a", label: "Server A" }],
  edges: [["lb", "a"]],
});

<Graph3D graph={graph} nodes={{ a: { active: pulse(frame, 40) } }} edges={{ "lb->a": ease(frame, 10, 30) }} />
<Packet from={graph.position("lb")} to={graph.position("a")} progress={ease(frame, 40, 56)} />`,
  },
  {
    id: "lanes",
    group: "Actors",
    name: "layoutLanes",
    summary:
      "The same graph once per lane, one behind the other, so two versions of a system run side by side in one shot: before and after, v1 beside v2. Each lane is a Graph of its own, with node ids prefixed by the lane's name. Send the same packet down both at the same frame and let the viewer see where they part.",
    demo: {
      component: LanesDemo,
      durationInFrames: 180,
      controls: [{ key: "gap", kind: "range", min: 5, max: 10, step: 0.5, initial: 6.5 }],
    },
    schemas: [{ title: "layoutLanes(graph, options)", schema: lanesSchema }],
    otherProps: [
      { name: "graph", type: "Graph", description: "What layoutGraph() or layoutHub() returned." },
      {
        name: "returns",
        type: "Record<lane, Graph & { labelAt }>",
        description: "One Graph per lane. `labelAt` is where a Label naming the lane goes; add it to the shot's targets.",
      },
    ],
    code: `const { before, after } = layoutLanes(graph);

<Label position={before.labelAt} size={0.5}>before</Label>
<Label position={after.labelAt} size={0.5}>after</Label>
<Graph3D graph={before} nodes={{ "before/jobs": { tone: "danger", active: failed, badge: "failed" } }} />
<Graph3D graph={after} />
<Packet from={before.position("before/api")} to={before.position("before/jobs")} progress={hop} tone="danger" />
<Packet from={after.position("after/api")} to={after.position("after/jobs")} progress={hop} tone="accent" />`,
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
      "Highlighted code on a flat card, because code at an angle is unreadable. Spotlight lines as they are spoken, or mark the lines a change removed and added. Shift the camera so the 3D subject sits on the other side.",
    demo: {
      component: CodePanelDemo,
      durationInFrames: 150,
      controls: [
        { key: "side", kind: "select", options: ["right", "left"], initial: "right" },
        { key: "title", kind: "text", initial: "round robin" },
        { key: "diff", kind: "select", options: ["off", "on"], initial: "off" },
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
