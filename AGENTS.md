# video-kit

Narrated 3D explainer videos built from React components (Remotion + React Three Fiber). The kit is `src/kit/`, each video is `src/videos/<name>/`, the docs page is `docs/`.

## Making a video

`skills/video-kit/SKILL.md` is the method, and its `references/` hold the rest: how each kind of video goes, and the props of every piece. It is written as a skill so an agent working in another repository can load it too:

```bash
ln -s "$PWD/skills/video-kit" ~/.claude/skills/video-kit
```

## Changing the kit

- A new component exports its schema with a `.describe()` on each prop, parses its props with it, and is exported from `src/kit/index.ts`.
- A new node shape is a component in `src/kit/shapes.tsx` that fits the 2 x 1.2 x 2 box and stands on its floor, built only from the four materials it is handed (`body`, `trim`, `inset`, `glow`), added to `nodeShapeSchema` and `shapes`. Look at it with `pnpm stills ShapeGallery 150 1`; the last argument renders full size.
- An actor that should dim takes an optional `id` and reads `useDim(id)`.
- Every component has an entry in `docs/registry.tsx` with a demo in `docs/demos*.tsx`.
- Look at a piece you changed in its gallery, the way `ShapeGallery` shows shapes: `ActorGallery` (Gate, Fan, Callout), `PanelGallery` (Lifecycle, Meter, EventTimeline, RecordCard, Phases), `OverlayGallery` (Proportion, Bars, Chat, Term, Chapter, Screenshot), `CompareGallery` (lanes, badges, code diff).
- A `<Player>` that plays narration needs `numberOfSharedAudioTags={0}`, or it crashes on the sixth beat.
- `skills/video-kit/references/pieces*` is written by `pnpm kit:api` from `docs/registry.tsx`. Run it after changing a schema, a summary or an example; the deploy fails when it is stale.
- A mistake the kit can detect from the layout or the camera is a thrown error that says what to change (`assertClearEdges`, `assertClearLabels`, `assertFraming`), not a rule in the skill. A mistake it can fix by itself, it fixes: a label the frame edge would cut hides.
- `pnpm stills <Id> cues --sheet` is how a video is looked at. Cue frames come from the video's `timeline`, through its `video.ts`.
