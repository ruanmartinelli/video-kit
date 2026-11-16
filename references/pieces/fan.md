# Fan

One thing becomes many, or many collapse into one: a request fanned out to shards, a batch split into jobs, duplicates merged into one record. One small packet per target, all driven by a single `progress`.

## Fan

- `from` Vec3, required. Center of the one: the node that fans out, or that the many collapse into.
- `to` Vec3[], required. Centers of the many, one small packet each.
- `direction` "split" | "merge" = "split". split travels from `from` to each of `to`; merge from each of `to` into `from`.
- `progress` number 0–1, required. 0 = all waiting, 1 = all arrived. Hidden at exactly 0 and 1.
- `tone` "neutral" | "accent" | "danger" = "neutral". White unless the story needs it to stand out or fail.
- `stagger` number 0–1 = 0. 0 = all leave together; 1 = each leaves as the one before arrives. In the order of `to`.
- `clear` [number, number]. Distance to stay clear of [`from`, each of `to`], whichever way they travel. Defaults to a node's edge.

## Example

```tsx
<Fan
  from={graph.position("search")}
  to={shards.map((id) => graph.position(id))}
  direction="split"
  stagger={0.3}
  progress={ease(frame, t.at("fanout"), t.at("fanout") + 60)}
  tone="accent"
/>
```
