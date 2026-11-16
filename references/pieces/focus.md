# Focus

Dims every actor inside it except the ones you name. Use it when the narration is about one thing.

## Focus

- `on` string[], required. Ids of the actors to keep lit. Everything else with an id dims.
- `amount` number 0–1 = 1. 0 = no dimming, 1 = fully dimmed. Drive it from the frame.

## Example

```tsx
<Focus on={["queue"]} amount={ease(frame, 25, 45)}>
  <Graph3D graph={graph} />
</Focus>
```
