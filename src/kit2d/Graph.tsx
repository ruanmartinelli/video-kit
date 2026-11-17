import type { z } from "zod";
import type { Graph as Laid } from "../kit/graph";
import type { nodeStateSchema, pipeSchema } from "../kit/schemas";
import { Node } from "./Node";
import { Pipe } from "./Pipe";

type NodeState = z.input<typeof nodeStateSchema>;
type PipeState = Pick<z.input<typeof pipeSchema>, "progress" | "tone" | "label">;

type GraphProps = {
  /** From layoutGraph(). */
  graph: Laid;
  /** Per-node state by node id: active, tone, appear, badge. */
  nodes?: Record<string, NodeState>;
  /** Per-edge state by edge id ("from->to"): its draw progress, or { progress, tone, label }. */
  edges?: Record<string, number | PipeState>;
};

/** Draws a laid-out graph as Nodes and Pipes. Node and edge ids double as Focus ids. */
export const Graph = ({ graph, nodes = {}, edges = {} }: GraphProps) => (
  <>
    {graph.edges.map((edge) => {
      const state = edges[edge.id];
      return (
        <Pipe
          key={edge.id}
          id={edge.id}
          from={graph.position(edge.from)}
          to={graph.position(edge.to)}
          {...(typeof state === "number" ? { progress: state } : state)}
        />
      );
    })}
    {graph.nodes.map((node) => (
      <Node key={node.id} id={node.id} position={node.position} label={node.label} shape={node.shape} change={node.change} {...nodes[node.id]} />
    ))}
  </>
);
