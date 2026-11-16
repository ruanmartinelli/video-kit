import type { Graph } from "./graph";
import { Node, type NodeState } from "./Node";
import { Pipe } from "./Pipe";

type Graph3DProps = {
  /** From layoutGraph(). */
  graph: Graph;
  /** Per-node state by node id: active, tone, appear, open, children. */
  nodes?: Record<string, NodeState>;
  /** Per-edge draw progress by edge id ("from->to"). */
  edges?: Record<string, number>;
};

/** Draws a laid-out graph as Nodes and Pipes. Node and edge ids double as Focus ids. */
export const Graph3D = ({ graph, nodes = {}, edges = {} }: Graph3DProps) => (
  <>
    {graph.edges.map((edge) => (
      <Pipe
        key={edge.id}
        id={edge.id}
        from={graph.position(edge.from)}
        to={graph.position(edge.to)}
        progress={edges[edge.id]}
      />
    ))}
    {graph.nodes.map((node) => (
      <Node key={node.id} id={node.id} position={node.position} label={node.label} {...nodes[node.id]} />
    ))}
  </>
);
