# Term

A word and its one-line meaning, pinned in a corner while the thing it names is on screen. For a viewer who is new to the codebase or the domain. One term at a time, and take it away when the narration moves on.

## Term

- `term` string, required. The word as the codebase uses it: `idempotent`, `tenant`, `outbox`.
- `meaning` string, required. One short line a newcomer can hold onto: `safe to run twice, same result`.
- `corner` "bottom-left" | "bottom-right" = "bottom-left". Which bottom corner it pins to. Pick the one the 3D subject is not in.
- `appear` number 0–1 = 1. 0 = hidden, 1 = fully in. Keep it up while the thing it names is on screen.

## Example

```tsx
<Term term="idempotent" meaning="safe to run twice, same result" appear={between(t.at("retry", "idempotent"), t.at("next"))} />
```
