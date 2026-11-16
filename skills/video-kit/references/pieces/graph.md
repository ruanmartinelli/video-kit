# Graph3D

Lays out nodes and pipes so nobody places coordinates by hand. `layoutGraph` runs first because the video needs the positions too, for packets and camera targets.

## layoutGraph(spec)

- `nodes` ({ id: string; label: string; shape: "service" | "database" | "server" | "queue" | "client" | "user" | "cloud" | "storage" | "file" | "controller" | "router" | "worker" | "clock" | "shield" | "trigger" | "agent" | "model" | "external" | "phone" | "notification" | "key" | "log"; change: "added" | "changed" | "removed" })[], required. Order within a column follows this order.
- `edges` ([string, string])[], required. [from, to] pairs. Must not form a cycle.
- `columnGap` number = 6. Distance between columns, left to right.
- `rowGap` number = 5. Distance between nodes in the same column. Under 5, a node's label reaches the node behind it.

## Also

- `graph` Graph. What layoutGraph() returned.
- `nodes` Record<id, NodeState>. Per-node active, tone, appear, open, children.
- `edges` Record<"from->to", number | { progress, tone, label }>. Per-edge draw progress, 0 to 1, or the pipe's progress, tone and label.

## Example

```tsx
const graph = layoutGraph({
  nodes: [{ id: "lb", label: "Load balancer" }, { id: "a", label: "Server A" }],
  edges: [["lb", "a"]],
});

<Graph3D graph={graph} nodes={{ a: { active: pulse(frame, 40) } }} edges={{ "lb->a": ease(frame, 10, 30) }} />
<Packet from={graph.position("lb")} to={graph.position("a")} progress={ease(frame, 40, 56)} />
```
