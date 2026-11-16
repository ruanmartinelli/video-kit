# Outcomes

For a change to existing behaviour, like an auth check or a shared helper. The same cases are answered before and after, and a row whose answer changed turns red. In the 3D world each case is a labelled Packet sent through the changed node twice; fill the row on the frame the packet reaches it.

## Outcomes

- `rows` ({ name: string; before: string; after: string; filled: number 0–2 })[], required. The same cases, tried before and after the change. Keep it to five or fewer.
- `heading` string = "who asks". What the names are: `who asks`, `input`, `caller`.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Row

- `name` string, required. Who or what is tried: a role, an input, a caller.
- `before` string, required. The answer before the change. One or two words: `blocked`, `$1,000.00`.
- `after` string, required. The answer after it.
- `filled` number 0–2 = 2. How much of the row is in: 0 = name only, 1 = `before` is in, 2 = `after` is in. Add two ease() calls. A row whose answers differ turns red as `after` arrives.

## Example

```tsx
const before = t.at("base", "admin");
const after = t.at("replay", "admin");
const hit = (start) => start + 14;

<World
  overlay={
    <Outcomes
      rows={[{
        name: "admin, other tenant",
        before: "blocked",
        after: "passes",
        filled: ease(frame, hit(before) - 4, hit(before) + 6) + ease(frame, hit(after) - 4, hit(after) + 6),
      }]}
    />
  }
>
  <Packet from={client} to={guard} progress={ease(frame, before, hit(before))} label="admin, other tenant" />
  <Packet from={guard} to={client} progress={ease(frame, hit(before), hit(before) + 14)} label="admin, other tenant" />
  <Packet from={client} to={guard} progress={ease(frame, after, hit(after))} label="admin, other tenant" />
  <Packet from={guard} to={api} progress={ease(frame, hit(after), hit(after) + 14)} label="admin, other tenant" tone="danger" />
</World>
```
