# Packet + Pipe

The packet is the thing the viewer follows: a request, a message, a row. The pipe is the connection it travels along. Both take node centers and stop at the node's edge.

## Packet

- `from` Vec3, required. Center of the node it leaves.
- `to` Vec3, required. Center of the node it reaches.
- `clear` [number, number]. Distance to stay clear of `from` and `to`. Defaults to a node's edge.
- `progress` number 0–1, required. 0 = leaving `from`, 1 = arriving at `to`. Hidden at exactly 0 and 1.
- `tone` "neutral" | "accent" | "danger" = "neutral". White unless the story needs it to stand out or fail.
- `label` string. Who or what this one is, riding above it: `admin`, `order 42`. A word or two. Use it when several packets take the same path and the story depends on telling them apart.

## Pipe

- `id` string. Name used by Focus to keep this pipe lit.
- `from` Vec3, required. Center of the node it leaves.
- `to` Vec3, required. Center of the node it reaches.
- `clear` [number, number]. Distance to stay clear of `from` and `to`. Defaults to a node's edge.
- `tone` "neutral" | "added" | "changed" | "removed" = "neutral". neutral is a plain connection; the rest mark what a PR did to it.
- `progress` number 0–1 = 1. How much of the pipe is drawn, growing out of `from`. 0 hides it.
- `label` string. What travels on it, under its middle: a route, a topic, a query name. Comes in with `progress`.

## Example

```tsx
<Pipe from={a} to={b} progress={ease(frame, 5, 30)} label="POST /orders" />
<Packet from={a} to={b} progress={ease(frame, 40, 85)} label="order 42" />
```
