import { z } from "zod";
import { NODE_HEIGHT, NODE_WIDTH } from "./geometry";
import type { Vec3 } from "./motion";
import { nodeShapeSchema, type NodeShape } from "./shapes";

const nodeSpecSchema = z.object({ id: z.string(), label: z.string(), shape: nodeShapeSchema.optional(), change: z.enum(["added", "changed", "removed"]).optional() });

export const graphSpecSchema = z.object({
  nodes: z.array(nodeSpecSchema).describe("Order within a column follows this order."),
  edges: z.array(z.tuple([z.string(), z.string()])).describe("[from, to] pairs. Must not form a cycle."),
  columnGap: z.number().default(6).describe("Distance between columns, left to right."),
  rowGap: z.number().default(5).describe("Distance between nodes in the same column. Under 5, a node's label reaches the node behind it."),
});

export type GraphSpec = z.input<typeof graphSpecSchema>;

export type Graph = {
  nodes: { id: string; label: string; shape?: NodeShape; change?: "added" | "changed" | "removed"; position: Vec3 }[];
  edges: { id: string; from: string; to: string }[];
  /** Center of a node. Use it for packets, extra pipes and camera targets. */
  position: (id: string) => Vec3;
};

export const edgeId = (from: string, to: string) => `${from}->${to}`;

/** A pipe on the floor that runs through a node it does not connect is always a mistake: say so, and how to fix it. */
const assertClearEdges = (nodes: Graph["nodes"], edges: [string, string][]) => {
  const at = new Map(nodes.map((node) => [node.id, node.position]));
  for (const [from, to] of edges) {
    const [ax, , az] = at.get(from) as Vec3;
    const [bx, , bz] = at.get(to) as Vec3;
    const lengthSquared = (bx - ax) ** 2 + (bz - az) ** 2;
    for (const node of nodes) {
      if (node.id === from || node.id === to || lengthSquared === 0) {
        continue;
      }
      const [px, , pz] = node.position;
      const along = Math.min(1, Math.max(0, ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / lengthSquared));
      const distance = Math.hypot(px - (ax + along * (bx - ax)), pz - (az + along * (bz - az)));
      if (distance < NODE_WIDTH / 2) {
        throw new Error(`Edge ${edgeId(from, to)} runs through node "${node.id}". Reorder \`nodes\` so "${node.id}" sits in another row, or widen \`rowGap\`.`);
      }
    }
  }
};

/**
 * Places nodes so edges flow left to right: each node sits one column past its
 * furthest upstream node, then moves right until it is one column before its
 * nearest downstream node, so no edge is longer than it has to be. Columns are
 * centered on the origin.
 */
export const layoutGraph = (input: GraphSpec): Graph => {
  const spec = graphSpecSchema.parse(input);
  const ids = new Set(spec.nodes.map((n) => n.id));
  for (const [from, to] of spec.edges) {
    for (const id of [from, to]) {
      if (!ids.has(id)) {
        throw new Error(`Edge ${edgeId(from, to)} names unknown node "${id}"`);
      }
    }
  }

  const column = new Map(spec.nodes.map((n) => [n.id, 0]));
  for (let pass = 0; pass <= spec.nodes.length; pass++) {
    let moved = false;
    for (const [from, to] of spec.edges) {
      const wanted = (column.get(from) ?? 0) + 1;
      if ((column.get(to) ?? 0) < wanted) {
        column.set(to, wanted);
        moved = true;
      }
    }
    if (!moved) {
      break;
    }
    if (pass === spec.nodes.length) {
      throw new Error("Graph edges form a cycle");
    }
  }

  // A node with slack (a second source feeding a late column, say) moves next to what it feeds.
  for (let pass = 0; pass < spec.nodes.length; pass++) {
    let moved = false;
    for (const node of spec.nodes) {
      const downstream = spec.edges.filter(([from]) => from === node.id).map(([, to]) => column.get(to) ?? 0);
      const wanted = Math.min(...downstream) - 1;
      if (downstream.length > 0 && wanted > (column.get(node.id) ?? 0)) {
        column.set(node.id, wanted);
        moved = true;
      }
    }
    if (!moved) {
      break;
    }
  }

  const columnCount = Math.max(...column.values()) + 1;
  const nodes = spec.nodes.map((node) => {
    const col = column.get(node.id) ?? 0;
    const siblings = spec.nodes.filter((n) => column.get(n.id) === col);
    const row = siblings.indexOf(node);
    const position: Vec3 = [
      (col - (columnCount - 1) / 2) * spec.columnGap,
      NODE_HEIGHT / 2,
      (row - (siblings.length - 1) / 2) * spec.rowGap,
    ];
    return { ...node, position };
  });

  assertClearEdges(nodes, spec.edges);
  return toGraph(nodes, spec.edges);
};

const toGraph = (nodes: Graph["nodes"], edges: [string, string][]): Graph => ({
  nodes,
  edges: edges.map(([from, to]) => ({ id: edgeId(from, to), from, to })),
  position: (id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) {
      throw new Error(`No node "${id}" in graph`);
    }
    return node.position;
  },
});

export const radiusSchema = z.union([z.number().positive(), z.tuple([z.number().positive(), z.number().positive()])]);

/** A radius as [across, deep]. */
export const radii = (radius: z.infer<typeof radiusSchema>): [number, number] => (typeof radius === "number" ? [radius, radius] : radius);

export const hubSpecSchema = z.object({
  hub: nodeSpecSchema.describe("The one in the middle: the shared helper, the table, the service everything calls."),
  spokes: z.array(nodeSpecSchema).min(1).describe("What surrounds it, clockwise from the front right. Eight is comfortable; past twelve the labels crowd."),
  radius: radiusSchema.default([8.5, 6]).describe("Distance from the hub to each spoke: one number for a circle, or [across, deep] for an ellipse that fills a wide frame."),
  direction: z.enum(["in", "out"]).default("in").describe("in: the spokes call the hub. out: the hub calls the spokes. Sets which way the edges and their ids run."),
});

export type HubSpec = z.input<typeof hubSpecSchema>;

/**
 * Places one node at the origin and the rest around it. For anything many
 * things depend on, where a left-to-right flow would hide that they all meet
 * in one place. Returns the same Graph as layoutGraph.
 */
export const layoutHub = (input: HubSpec): Graph => {
  const spec = hubSpecSchema.parse(input);
  const [across, deep] = radii(spec.radius);
  const y = NODE_HEIGHT / 2;
  const spokes = spec.spokes.map((spoke, index) => {
    // Half a step off the axes, so no spoke stands straight in front of the hub.
    const angle = ((index + 0.5) / spec.spokes.length) * Math.PI * 2;
    const position: Vec3 = [Math.cos(angle) * across, y, Math.sin(angle) * deep];
    return { ...spoke, position };
  });
  const edges = spec.spokes.map((spoke): [string, string] => (spec.direction === "in" ? [spoke.id, spec.hub.id] : [spec.hub.id, spoke.id]));
  return toGraph([{ ...spec.hub, position: [0, y, 0] }, ...spokes], edges);
};
