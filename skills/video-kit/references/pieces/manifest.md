# Manifest

The opening card of a video that covers more than one thing, like a review or a release: every item, in the order the video covers them, and a line for what it leaves out. Bring it back between sections with `current` set, so the viewer knows where they are.

## Manifest

- `items` ({ kind: string; name: string; change: "added" | "changed" | "removed"; note: string; appear: number 0–1 })[], required. What the video covers, riskiest first: changed behaviour before new surface. Six or fewer.
- `title` string = "What to look at". The heading over the list. Say what is being covered: `What to look at in this PR`, `What changes in v2`.
- `footer` string. What the video leaves out, so the viewer knows it was a choice: `31 other files: ordinary changes, not shown`.
- `current` number. Index of the item the video covers next. The rest dim. Set it when the manifest comes back between sections.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Item

- `kind` string, required. What sort of thing it is, in the viewer's words: `Auth`, `Shared code`, `New endpoint`.
- `name` string, required. The thing itself, as it is written in the code: `requireAdmin`, `POST /api-keys`.
- `change` "added" | "changed" | "removed", required. changed: existing behaviour moved. added: new surface. removed: something callers had is gone.
- `note` string. The one fact that sizes it: `8 callers, 5 not updated`.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Stagger the rows with ease().

## Example

```tsx
<Manifest
  items={[
    { kind: "Auth", name: "requireAdmin", change: "changed", note: "existing policy changed" },
    { kind: "New endpoint", name: "GET /invoices/export", change: "added" },
  ]}
  footer="31 other files: ordinary changes, not shown"
  appear={1 - ease(frame, t.at("auth") - 12, t.at("auth"))}
/>
```
