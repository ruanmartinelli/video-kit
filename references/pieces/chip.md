# Chip

A small tag in a top corner that names what is on screen: a file, a migration, which run this is. It can stay up while a panel is docked. Keep it short: a long path runs under a panel on the same side, so put the directory in `caption` and the file name in the chip.

## Chip

- `children` string, required. A filename, a migration name, a `file:line`. One line.
- `tone` "neutral" | "added" | "changed" | "removed" = "neutral". Color of the dot. Use it for what the change being shown did to the thing named.
- `caption` string. Small text above it that says what kind of thing it is: `migration`, `changed file`.
- `corner` "top-left" | "top-right" = "top-left"
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Drive with ease().

## Example

```tsx
<Chip caption="migration, in db/migrate" tone="added" appear={between(frame, t.at("schema"), t.at("request"))}>
  20260114_add_api_keys.sql
</Chip>

<Chip caption="run on screen" corner="top-right" appear={between(frame, t.at("before"), t.at("after"))}>
  before the change
</Chip>
```
