import type { Graph } from "./graph";
import { Node, type NodeState } from "./Node";
import { Pipe, type PipeState } from "./Pipe";

type Graph3DProps = {
  /** From layoutGraph(). */
  graph: Graph;
  /** Per-node state by node id: active, tone, appear, open, children. */
  nodes?: Record<string, NodeState>;
  /** Per-edge state by edge id ("from->to"): its draw progress, or { progress, tone, label }. */
  edges?: Record<string, number | PipeState>;
};

/** Draws a laid-out graph as Nodes and Pipes. Node and edge ids double as Focus ids. */
export const Graph3D = ({ graph, nodes = {}, edges = {} }: Graph3DProps) => (
  <>
    {graph.edges.map((edge) => {
      const state = edges[edge.id];
      return <Pipe key={edge.id} id={edge.id} from={graph.position(edge.from)} to={graph.position(edge.to)} {...(typeof state === "number" ? { progress: state } : state)} />;
    })}
    {graph.nodes.map((node) => (
      <Node key={node.id} id={node.id} position={node.position} label={node.label} shape={node.shape} change={node.change} {...nodes[node.id]} />
    ))}
  </>
);
