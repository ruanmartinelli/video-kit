import { z } from "zod";
import { NODE_HEIGHT } from "./geometry";
import type { Vec3 } from "./motion";

export const graphSpecSchema = z.object({
  nodes: z.array(z.object({ id: z.string(), label: z.string() })).describe("Order within a column follows this order."),
  edges: z.array(z.tuple([z.string(), z.string()])).describe("[from, to] pairs. Must not form a cycle."),
  columnGap: z.number().default(6).describe("Distance between columns, left to right."),
  rowGap: z.number().default(5).describe("Distance between nodes in the same column."),
});

export type GraphSpec = z.input<typeof graphSpecSchema>;

export type Graph = {
  nodes: { id: string; label: string; position: Vec3 }[];
  edges: { id: string; from: string; to: string }[];
  /** Center of a node. Use it for packets, extra pipes and camera targets. */
  position: (id: string) => Vec3;
};

export const edgeId = (from: string, to: string) => `${from}->${to}`;

/**
 * Places nodes so edges flow left to right: each node sits one column past its
 * furthest upstream node, and columns are centered on the origin.
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

  return {
    nodes,
    edges: spec.edges.map(([from, to]) => ({ id: edgeId(from, to), from, to })),
    position: (id) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) {
        throw new Error(`No node "${id}" in graph`);
      }
      return node.position;
    },
  };
};
