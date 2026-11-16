# Node shapes

What a Node looks like. Pick the shape that names the thing, so the viewer reads it before the label. All of them fit the same 2 x 1.2 x 2 box, so pipes, packets, the camera and `open` work the same on each. For systems: `database`, `server`, `queue`, `client` (a screen), `phone`, `user`, `cloud` (the internet), `external` (a system someone else runs), `storage` (files), `log` (an append-only record), `clock` (a schedule), `notification` (an email, an alert). For code: `router`, `controller`, `worker` (a job), `trigger` (code that runs because something else happened), `agent` (an automation or assistant), `model` (the LLM it calls), `file` (any module), `shield` (a check every request passes), `key` (a credential). `service` is the plain box.

## Example

```tsx
<Node position={p} label="Orders DB" shape="database" />

const graph = layoutGraph({
  nodes: [
    { id: "web", label: "Web", shape: "client" },
    { id: "api", label: "API", shape: "server" },
    { id: "db", label: "Database", shape: "database" },
  ],
  edges: [["web", "api"], ["api", "db"]],
});
```
