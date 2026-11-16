# Lifecycle

The states a record moves through, in a row, with the current one lit and a marker that travels between them. Use it when the story is about one record changing state: an order, a job, a sync. It is a straight line; a flow that branches is a graph.

## Lifecycle

- `states` ({ name: string; tone: "neutral" | "danger" })[], required. The states in the order a record moves through them, left to right.
- `current` number, required. Index of the state the record is in. A fractional value puts the marker between two states, so ease() from one index to the next moves it; the state nearest the marker is lit.
- `title` string. Which record this is: `order 1042`.
- `side` "left" | "right" = "right". Pair with the CameraRig shot's `shift` to move the 3D subject clear of it.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## State

- `name` string, required. The state as the code spells it: `Pending`, `Paid`. One or two words.
- `tone` "neutral" | "danger" = "neutral". danger for a state the record should not end in: `Canceled`, `Failed`.

## Example

```tsx
<Lifecycle
  title="order 1042"
  states={[{ name: "Pending" }, { name: "Paid" }, { name: "Shipped" }, { name: "Canceled", tone: "danger" }]}
  current={ease(frame, t.at("paid"), t.at("paid") + 18) + ease(frame, t.at("shipped"), t.at("shipped") + 18)}
/>
```
