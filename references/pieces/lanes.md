# layoutLanes

The same graph once per lane, one behind the other, so two versions of a system run side by side in one shot: before and after, v1 beside v2. Each lane is a Graph of its own, with node ids prefixed by the lane's name. Send the same packet down both at the same frame and let the viewer see where they part. Lanes are for two paths that differ; when the path is the same and only the answer differs, `Outcomes` shows it on one graph.

## layoutLanes(graph, options)

- `lanes` string[] = ["before","after"]. One name per copy, back to front. The first is furthest from the camera.
- `gap` number. Distance from one lane's middle to the next. Defaults to the graph's own depth plus room for labels.

## Also

- `graph` Graph. What layoutGraph() or layoutHub() returned.
- `returns` Record<lane, Graph & { labelAt }>. One Graph per lane. `labelAt` is where a Label naming the lane goes; add it to the shot's targets.

## Example

```tsx
const { before, after } = layoutLanes(graph);

<Label position={before.labelAt} size={0.5}>before</Label>
<Label position={after.labelAt} size={0.5}>after</Label>
<Graph3D graph={before} nodes={{ "before/jobs": { tone: "danger", active: failed, badge: "failed" } }} />
<Graph3D graph={after} />
<Packet from={before.position("before/api")} to={before.position("before/jobs")} progress={hop} tone="danger" />
<Packet from={after.position("after/api")} to={after.position("after/jobs")} progress={hop} tone="accent" />
```
