import { z } from "zod";
import { shotSchema } from "./camera";
import { radiusSchema } from "./graph";
import { unitSchema, vec3Schema } from "./motion";
import { nodeShapeSchema } from "./shapeNames";

// The props of every actor, apart from the code that draws it, so a flat kit can check its props
// with the same schemas without loading the 3D one.

export const nodeStateSchema = z.object({
  active: unitSchema.default(0).describe("0 = idle, 1 = fully lit in the tone color."),
  tone: z.enum(["accent", "danger"]).default("accent").describe("Color it lights up in. Use danger for overload or failure."),
  appear: z.number().min(0).default(1).describe("0 = not in the scene, 1 = fully there. Drive with pop(), which overshoots a little."),
  open: unitSchema.default(0).describe("0 = solid, 1 = glass shell with its children visible inside."),
  badge: z
    .enum(["locked", "syncing", "failed", "done"])
    .optional()
    .describe("A small mark at its top right corner for a state it is in: locked, syncing, failed, done. Set it from the frame the state starts."),
});

export const nodeSchema = nodeStateSchema.extend({
  id: z.string().optional().describe("Name used by Focus to keep this node lit."),
  position: vec3Schema.describe("Center of the box. y = NODE_HEIGHT / 2 sits it on the floor."),
  label: z.string(),
  change: z
    .enum(["added", "changed", "removed"])
    .optional()
    .describe(
      "What the change being shown did to this node: a pull request, a migration, a new version. Colors its outline; leave it out for nodes the change did not touch.",
    ),
  shape: nodeShapeSchema.default("service").describe("What it looks like. Pick the one that names what the node is; service is a plain box."),
});

export const pipeSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this pipe lit."),
  from: vec3Schema.describe("Center of the node it leaves."),
  to: vec3Schema.describe("Center of the node it reaches."),
  clear: z
    .tuple([z.number().min(0), z.number().min(0)])
    .optional()
    .describe("Distance to stay clear of `from` and `to`. Defaults to a node's edge."),
  tone: z
    .enum(["neutral", "added", "changed", "removed"])
    .default("neutral")
    .describe("neutral is a plain connection; the rest mark what the change being shown did to it."),
  progress: unitSchema.default(1).describe("How much of the pipe is drawn, growing out of `from`. 0 hides it."),
  label: z.string().optional().describe("What travels on it, under its middle: a route, a topic, a query name. Comes in with `progress`."),
});

export const packetSchema = z.object({
  from: vec3Schema.describe("Center of the node it leaves."),
  to: vec3Schema.describe("Center of the node it reaches."),
  clear: z
    .tuple([z.number().min(0), z.number().min(0)])
    .optional()
    .describe("Distance to stay clear of `from` and `to`. Defaults to a node's edge."),
  progress: unitSchema.describe("0 = leaving `from`, 1 = arriving at `to`. Hidden at exactly 0 and 1."),
  tone: z.enum(["neutral", "accent", "danger"]).default("neutral").describe("White unless the story needs it to stand out or fail."),
  label: z
    .string()
    .optional()
    .describe(
      "Who or what this one is, riding above it: `admin`, `order 42`. A word or two. Use it when several packets take the same path and the story depends on telling them apart.",
    ),
});

export const gateSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this gate lit."),
  from: vec3Schema.describe("Center of the node the pipe leaves."),
  to: vec3Schema.describe("Center of the node the pipe reaches."),
  at: unitSchema.default(0.5).describe("Where along the visible pipe it stands: 0 = at `from`'s edge, 1 = at `to`'s edge."),
  rule: z.string().optional().describe("The condition it checks, in mono above the ring: `qty < minimum`, `role == admin`. A few words."),
  active: unitSchema.default(0).describe("0 = idle grey, 1 = fully lit in `tone`. Pulse it on the frame a packet reaches the ring."),
  tone: z.enum(["accent", "danger"]).default("accent").describe("What it lights up in: accent when a packet passes, danger when one bounces."),
  appear: z.number().min(0).default(1).describe("0 = not in the scene, 1 = fully there. Drive with pop(), which overshoots a little."),
});

export const fanSchema = z.object({
  from: vec3Schema.describe("Center of the one: the node that fans out, or that the many collapse into."),
  to: z.array(vec3Schema).min(2).max(12).describe("Centers of the many, one small packet each."),
  direction: z.enum(["split", "merge"]).default("split").describe("split travels from `from` to each of `to`; merge from each of `to` into `from`."),
  progress: unitSchema.describe("0 = all waiting, 1 = all arrived. Hidden at exactly 0 and 1."),
  tone: z.enum(["neutral", "accent", "danger"]).default("neutral").describe("White unless the story needs it to stand out or fail."),
  stagger: unitSchema.default(0).describe("0 = all leave together; 1 = each leaves as the one before arrives. In the order of `to`."),
  clear: z
    .tuple([z.number().min(0), z.number().min(0)])
    .optional()
    .describe("Distance to stay clear of [`from`, each of `to`], whichever way they travel. Defaults to a node's edge."),
});

export const calloutSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this callout lit."),
  at: vec3Schema.describe("The point it is about. A small dot marks it."),
  children: z.string().describe("The note. A few words."),
  offset: z
    .tuple([z.number(), z.number()])
    .default([1.6, 1.8])
    .describe("Where the note sits from `at`, in world units on screen: [right, up]. A negative right puts it on the left."),
  tone: z.enum(["neutral", "accent", "danger"]).default("neutral").describe("neutral for a remark; accent or danger to tie it to what is lit."),
  appear: unitSchema.default(1).describe("0 = hidden. The line grows out of `at` over the first half, then the note comes in. Drive with ease()."),
});

export const labelSchema = z.object({
  position: vec3Schema.describe("Bottom-center of the text."),
  children: z.string().describe("The text. Keep it to a few words."),
  size: z.number().default(0.36).describe("Text height in world units."),
  opacity: unitSchema.default(1),
});

export const rippleSchema = z.object({
  at: vec3Schema.describe("Where it starts: the center of the node that changed. Drawn on the floor under it."),
  radius: radiusSchema
    .default([10, 7.2])
    .describe("Where the front is at progress 1, and gone. Set it a little past what it should reach; give layoutHub's radius shape to match its spokes."),
  progress: unitSchema.describe("0 = nothing yet, 1 = the front is at `radius`. The front travels at a steady pace, so it reaches halfway at 0.5."),
  tone: z
    .enum(["accent", "danger", "added", "changed", "removed"])
    .default("changed")
    .describe("changed for how far a change reaches; danger for a failure spreading."),
  rings: z.number().int().min(1).max(5).default(3).describe("The front plus the echoes that trail it."),
});

export const cameraRigSchema = z.object({
  shots: z.array(shotSchema).min(1).describe("Ordered by `at`. The first shot is where the camera starts."),
  moveFrames: z.number().default(45).describe("Frames each move between shots takes."),
  sway: z.number().default(3).describe("Degrees of slow side-to-side drift. 0 locks the camera off."),
});
