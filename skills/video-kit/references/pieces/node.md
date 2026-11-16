# Node

A service, process or machine. It can pop into the scene, light up, carry a badge for the state it is in, and turn to glass to show what is inside it. Children are the internals, in the node's local space.

## Node

- `active` number 0–1 = 0. 0 = idle, 1 = fully lit in the tone color.
- `tone` "accent" | "danger" = "accent". Color it lights up in. Use danger for overload or failure.
- `appear` number = 1. 0 = not in the scene, 1 = fully there. Drive with pop(), which overshoots a little.
- `open` number 0–1 = 0. 0 = solid, 1 = glass shell with its children visible inside.
- `badge` "locked" | "syncing" | "failed" | "done". A small mark at its top right corner for a state it is in: locked, syncing, failed, done. Set it from the frame the state starts.
- `id` string. Name used by Focus to keep this node lit.
- `position` Vec3, required. Center of the box. y = NODE_HEIGHT / 2 sits it on the floor.
- `label` string, required
- `change` "added" | "changed" | "removed". What a PR did to this node. Colors its outline; leave it out for nodes the PR did not touch.
- `shape` "service" | "database" | "server" | "queue" | "client" | "user" | "cloud" | "storage" | "file" | "controller" | "router" | "worker" | "clock" | "shield" | "trigger" | "agent" | "model" | "external" | "phone" | "notification" | "key" | "log" = "service". What it looks like. Pick the one that names what the node is; service is a plain box.

## Also

- `children` ReactNode. Internals. Only visible as `open` goes to 1. The box is 2 x 1.2 x 2.

## Example

```tsx
<Node
  position={[0, NODE_HEIGHT / 2, 0]}
  label="Service"
  appear={pop(frame, 8)}
  active={pulse(frame, 55, 30)}
  open={ease(frame, 105, 125)}
>
  <Internals />
</Node>
```
