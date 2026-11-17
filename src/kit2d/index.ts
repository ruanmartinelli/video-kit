// The flat kit: the same pieces and the same props as "video-kit", drawn in 2D.
// Nothing here loads the 3D kit, so a flat video bundles and renders without it.

// Stage and actors, drawn flat.
export { CameraRig, World } from "./World";
export { Graph, Graph as Graph3D } from "./Graph";
export { Callout } from "./Callout";
export { Fan } from "./Fan";
export { Gate, gatePoint } from "./Gate";
export { Label } from "./Label";
export { Node, type NodeState } from "./Node";
export { Packet } from "./Packet";
export { CLEAR as NODE_CLEAR, Pipe } from "./Pipe";
export { Ripple } from "./Ripple";

// Everything that was already flat or has nothing to draw is the 3D kit's own.
export { Bars, barSchema, barsSchema } from "../kit/Bars";
export { shotSchema, views, type Shot } from "../kit/camera";
export { Caption, captionSchema } from "../kit/Caption";
export { Chapter, chapterSchema } from "../kit/Chapter";
export { Chat, chatMessageSchema, chatSchema } from "../kit/Chat";
export { Chip, chipSchema } from "../kit/Chip";
export { CodePanel, codePanelSchema } from "../kit/CodePanel";
export { EventTimeline, eventTimelineSchema, timelineEventSchema, timelineTickSchema } from "../kit/EventTimeline";
export { Focus, focusSchema } from "../kit/Focus";
export { NODE_HEIGHT, NODE_WIDTH } from "../kit/geometry";
export {
  edgeId,
  graphSpecSchema,
  hubSpecSchema,
  lanesSchema,
  layoutGraph,
  layoutHub,
  layoutLanes,
  type GraphSpec,
  type HubSpec,
  type Lane,
} from "../kit/graph";
export { Lifecycle, lifecycleSchema, lifecycleStateSchema } from "../kit/Lifecycle";
export { Manifest, manifestItemSchema, manifestSchema } from "../kit/Manifest";
export { Meter, meterSchema } from "../kit/Meter";
export { between, ease, hop, lerp, lerp3, pop, pulse, type Vec3 } from "../kit/motion";
export { Narration } from "../kit/Narration";
export { outcomeSchema, Outcomes, outcomesSchema } from "../kit/Outcomes";
export { Phases, phasesSchema } from "../kit/Phases";
export { Proportion, proportionSchema } from "../kit/Proportion";
export { RecordCard, recordCardSchema, recordFieldSchema } from "../kit/RecordCard";
export { Schedule, scheduleRowSchema, scheduleSchema } from "../kit/Schedule";
export * from "../kit/schemas";
export { highlightSchema, Screenshot, screenshotSchema } from "../kit/Screenshot";
export { nodeShapeSchema, type NodeShape } from "../kit/shapeNames";
export { Storyboard, storyboardMeta, storyboardPanelSchema, storyboardSchema, type StoryboardProps } from "../kit/Storyboard";
export { columnSchema, linkSchema, Tables, tableSchema, tablesSchema } from "../kit/Tables";
export { Term, termSchema } from "../kit/Term";
export { theme } from "../kit/theme";
export { createTimeline, cueFrames, type Narration as NarrationData, type Timeline } from "../kit/timeline";
export type { Video } from "../kit/video";
