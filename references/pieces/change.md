# Change marks

For showing what a change did: a pull request, a migration, a new version. `change` on a Node, a Table or a column says what happened to it: green is added, amber is changed, red is removed. Leave it off everything the change did not touch, so color always means the change. Chip names the file or migration on screen so the viewer can go find it.

## Chip

- `children` string, required. A filename, a migration name, a `file:line`. One line.
- `tone` "neutral" | "added" | "changed" | "removed" = "neutral". Color of the dot. Use it for what the change being shown did to the thing named.
- `caption` string. Small text above it that says what kind of thing it is: `migration`, `changed file`.
- `corner` "top-left" | "top-right" = "top-left"
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
const graph = layoutGraph({
  nodes: [
    { id: "router", label: "Router", change: "changed" },
    { id: "new", label: "RefundsController", change: "added" },
  ],
  edges: [["router", "new"]],
});

<World overlay={<Chip caption="new file" tone="added">src/controllers/refunds.ts</Chip>}>
```
