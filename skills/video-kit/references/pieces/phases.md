# Phases

A rollout as a strip of steps: the ones done are checked, the current one is lit. For a plan or a migration, where the viewer needs to know where in the sequence the video is.

## Phases

- `steps` string[], required. The rollout's steps in order, a word or two each: `shadow`, `compare`, `move one`, `migrate`.
- `current` number, required. Where the rollout is. Steps below it are done and get a check; the step at Math.floor(current) is lit; later steps are dim. `steps.length` means all done. Drive with ease() from one index to the next.
- `note` string. One line under the strip about the step on screen: `the old path keeps running`.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
<Phases
  steps={["shadow", "compare", "move one", "migrate"]}
  current={ease(frame, t.at("compare"), t.at("compare") + 12) + ease(frame, t.at("move"), t.at("move") + 12)}
  note="the old path keeps running"
/>
```
