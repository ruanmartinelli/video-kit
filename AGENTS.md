# video-kit

A skill for making narrated 3D explainer videos from React components (Remotion + React Three Fiber). This repository is the skill: an agent in any project loads `SKILL.md` and makes its video in that project.

The skill is a toolkit. `SKILL.md` and each piece's text say what a piece draws, how to drive it and how to check the result. What a video says, and in what order, belongs to the agent that makes it.

- `SKILL.md`, `references/`: what an agent reads to make a video.
- `template/`: the small video every new one starts from.
- `src/kit/`: the pieces. `src/registry.ts`: one entry per piece, the source of `references/pieces*`.
- `src/gallery/`: scenes for looking at pieces while changing them.
- `scripts/`: narrate, check, stills, render, storyboard. Each takes a video folder's path.

Install it as a skill by cloning or linking this folder into `~/.claude/skills/video-kit`.

## Changing the kit

- A new component exports its schema with a `.describe()` on each prop, parses its props with it, and is exported from `src/kit/index.ts`.
- Every piece has an entry in `src/registry.ts`: a summary, its schemas and an example. `pnpm kit:api` writes `references/pieces*` from it; CI fails when they are stale. That entry is the one place a piece is described: `SKILL.md` names a page, and the page says it.
- A new node shape is a component in `src/kit/shapes.tsx` that fits the 2 x 1.2 x 2 box and stands on its floor, built only from the four materials it is handed (`body`, `trim`, `inset`, `glow`), added to `nodeShapeSchema` and `shapes`. Look at it with `pnpm stills ShapeGallery 150 1`; the last argument renders full size.
- An actor that should dim takes an optional `id` and reads `useDim(id)`.
- Look at a piece you changed in its gallery: `ShapeGallery`, `ActorGallery` (Gate, Fan, Callout), `PanelGallery` (Lifecycle, Meter, EventTimeline, RecordCard, Phases), `OverlayGallery` (Proportion, Bars, Chat, Term, Chapter, Screenshot), `CompareGallery` (lanes, badges, code diff). `pnpm stills <GalleryId> [frames]` writes to `out/stills/<GalleryId>/`.
- A mistake the kit can detect from the layout or the camera is a thrown error that says what to change (`assertClearEdges`, `assertClearLabels`, `assertFraming`), not a rule in the skill. A mistake it can fix by itself, it fixes: a label the frame edge would cut hides.
- `template/` is what agents copy and the kit's one end-to-end test. `pnpm test` typechecks, checks the reference is current, and renders the template's cue sheet: read the sheet after a change to the camera, the layout or a piece the template uses.
- A video is not part of the kit. `scripts/project.mjs` writes an entry file and a tsconfig for the folder it is given, under `.cache/`.
