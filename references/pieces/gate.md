# Gate

A condition drawn on the connection itself: a ring the pipe runs through, with its rule above it. A packet that matches goes on through; one that does not travels back to where it came from. Use it for a trigger condition, a filter or a guard that is one line of code and not worth a node. A packet stops at `gatePoint()`, then a second packet carries on or returns.

## Gate

- `id` string. Name used by Focus to keep this gate lit.
- `from` Vec3, required. Center of the node the pipe leaves.
- `to` Vec3, required. Center of the node the pipe reaches.
- `at` number 0–1 = 0.5. Where along the visible pipe it stands: 0 = at `from`'s edge, 1 = at `to`'s edge.
- `rule` string. The condition it checks, in mono above the ring: `qty < minimum`, `role == admin`. A few words.
- `active` number 0–1 = 0. 0 = idle grey, 1 = fully lit in `tone`. Pulse it on the frame a packet reaches the ring.
- `tone` "accent" | "danger" = "accent". What it lights up in: accent when a packet passes, danger when one bounces.
- `appear` number = 1. 0 = not in the scene, 1 = fully there. Drive with pop(), which overshoots a little.

## Also

- `gatePoint(from, to, at?)` Vec3. The ring's center. Send a Packet to it with `clear={[NODE_CLEAR, 0]}`, and on from it with `clear={[0, NODE_CLEAR]}`.

## Example

```tsx
const gate = gatePoint(api, stock);
const reach = t.at("check", "stock"); // the frame the packet is at the ring

<Pipe from={api} to={stock} />
<Gate from={api} to={stock} rule="qty <= stock" active={pulse(frame, reach, 25)} tone={passes ? "accent" : "danger"} />
<Packet from={api} to={gate} clear={[NODE_CLEAR, 0]} progress={ease(frame, reach - 25, reach)} label="qty 2" />
{/* One frame early: a Packet is hidden at exactly 0 and 1. */}
<Packet from={gate} to={passes ? stock : api} clear={[0, NODE_CLEAR]} progress={ease(frame, reach - 1, reach + 24)} tone={passes ? "accent" : "danger"} label="qty 2" />
```
