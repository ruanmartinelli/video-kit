# layoutHub + Ripple

For something many things depend on: a shared helper, a table, a core service. `layoutHub` puts it in the middle with its dependents around it and returns the same Graph as `layoutGraph`. `Ripple` spreads from it across the floor; light each dependent as the front reaches it.

## layoutHub(spec)

- `hub` { id: string; label: string; shape: "service" | "database" | "server" | "queue" | "client" | "user" | "cloud" | "storage" | "file" | "controller" | "router" | "worker" | "clock" | "shield" | "trigger" | "agent" | "model" | "external" | "phone" | "notification" | "key" | "log"; change: "added" | "changed" | "removed" }, required. The one in the middle: the shared helper, the table, the service everything calls.
- `spokes` ({ id: string; label: string; shape: "service" | "database" | "server" | "queue" | "client" | "user" | "cloud" | "storage" | "file" | "controller" | "router" | "worker" | "clock" | "shield" | "trigger" | "agent" | "model" | "external" | "phone" | "notification" | "key" | "log"; change: "added" | "changed" | "removed" })[], required. What surrounds it, clockwise from the front right. Eight is comfortable; past twelve the labels crowd.
- `radius` unknown = [8.5,6]. Distance from the hub to each spoke: one number for a circle, or [across, deep] for an ellipse that fills a wide frame.
- `direction` "in" | "out" = "in". in: the spokes call the hub. out: the hub calls the spokes. Sets which way the edges and their ids run.

## Ripple

- `at` Vec3, required. Where it starts: the center of the node that changed. Drawn on the floor under it.
- `radius` unknown = [10,7.2]. Where the front is at progress 1, and gone. Set it a little past what it should reach; give layoutHub's radius shape to match its spokes.
- `progress` number 0–1, required. 0 = nothing yet, 1 = the front is at `radius`. The front travels at a steady pace, so it reaches halfway at 0.5.
- `tone` "accent" | "danger" | "added" | "changed" | "removed" = "changed". changed for a PR's blast radius; danger for a failure spreading.
- `rings` number = 3. The front plus the echoes that trail it.

## Example

```tsx
const graph = layoutHub({
  hub: { id: "helper", label: "formatMoney()", shape: "file", change: "changed" },
  spokes: callers.map((name) => ({ id: name, label: name, shape: "file" })),
});

// The front moves at a steady pace: it is at a spoke 85% of the way through.
const start = t.at("outside");
const progress = Math.min(1, Math.max(0, (frame - start) / 60));

<Ripple at={graph.position("helper")} progress={progress} />
const hit = start + 51;
<Graph3D graph={graph} nodes={{ PayoutExport: { active: ease(frame, hit - 4, hit + 8), tone: frame >= hit - 4 ? "danger" : "accent" } }} />
```
