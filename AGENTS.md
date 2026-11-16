# video-kit

Narrated 3D explainer videos built from React components (Remotion + React Three Fiber). The kit is `src/kit/`, each video is `src/videos/<name>/`, the docs page is `docs/`.

`src/videos/load-balancer/` is the reference video. Copy its shape.

## Making a video

1. **Write the beat sheet.** `src/videos/<name>/script.json`: a voice and a list of beats, each `{ "id", "text" }`. A beat is one spoken sentence and one thing changing on screen. The video answers one question, opens on the problem, follows one concrete example through the system, and ends on what the solution costs. Done when you can say, for every beat, what moves on screen while it is spoken. A beat a still image could carry gets rewritten or cut.

2. **Narrate.** `pnpm narrate <name>` writes `narration.json` and one MP3 per beat. Unchanged beats are reused. When edge-tts returns no audio for a beat three times, it is rejecting that sentence: split the beat in two or shorten it.

3. **Compose.** One file, `src/videos/<name>/<Name>.tsx`, registered in `src/Root.tsx`:
   - `createTimeline(narration)` gives `t`. Every animation starts at a cue: `t.at(beat)` or `t.at(beat, word)`.
   - `layoutGraph(...)` gives positions. Give each node the `shape` that names what it is (`database`, `server`, `queue`, `client`, `user`, `cloud`, `storage` for systems; `router`, `controller`, `worker`, `file` for code); `service` is the plain box. Packets, extra pipes and camera targets all read `graph.position(id)`.
   - One `<World>`, one `<CameraRig>`, actors as children; `Narration`, `Caption` and `CodePanel` in `overlay`.

4. **Look at it.** `pnpm stills <CompositionId>` renders one frame per second to `out/stills/<CompositionId>/`; pass `120,340,515` to render chosen frames. Read the PNGs. Done when every still passes all of these:
   - the subject of the current beat is in frame and nothing stands in front of it
   - every label is whole and clear of other labels
   - captions and code are readable
   - something differs from the still before it

5. **Render.** `pnpm typecheck`, then `pnpm render <CompositionId> out/<name>.mp4`.

## Reviewing a PR

`src/videos/pr-api-keys/` is the reference. Schema first, then one request followed from the client to the table rows it reads and writes, ending on the thing the reviewer should check.

- Set `change` (`added`, `changed`, `removed`) on every node, table and column the PR touched, and on nothing else: color means this PR.
- One beat per migration, with a `Chip` naming its file. Columns enter with `appear`.
- A query is two packets, service to database and database to `tableRow(...)`, and the row's `lit` pulses when the second one lands.
- Name the file on screen with a `Chip` for every hop whose code the narration talks about, so the viewer can check it against the diff.
- Stand tables beside the request path, staggered in depth. Behind it, the path's nodes end up in front of them in every table shot.

## How the kit works

**One world.** A video is a single `World` the camera travels through. Change what the camera frames to move the story on; the scene itself stays.

**Motion is a function of the frame.** Read `useCurrentFrame()` and shape it with `ease`, `pulse` and `pop` from the kit. Remotion renders frames out of order and in parallel, so anything driven by a clock (R3F `useFrame` deltas, drei `<Float>`, physics) renders wrong.

**The camera frames targets.** A shot is `targets` plus a `view` and `azimuth`; `CameraRig` works out where to stand. When a still shows something blocking the subject, change `azimuth` or `view`. When an overlay covers the subject, use `shift`.

**Text.** 3D text goes through `Label`, which holds the render until the text is typeset; raw drei `<Text>` is missing from rendered frames. Sentences and code go in `overlay`, flat.

**Coordinates.** Node positions come from `layoutGraph`. Hand-written coordinates belong only inside a `Node`'s children, in its local 2 x 1.2 x 2 box.

**Props are validated.** Every component parses its props with the Zod schema exported beside it. A `ZodError` at render names the prop that is out of range. The schemas are the reference for props; `pnpm docs:dev` renders them with live demos.

## Changing the kit

- A new component exports its schema with a `.describe()` on each prop, parses its props with it, and is exported from `src/kit/index.ts`.
- A new node shape is a component in `src/kit/shapes.tsx` that fits the 2 x 1.2 x 2 box and stands on its floor, built only from the four materials it is handed (`body`, `trim`, `inset`, `glow`), added to `nodeShapeSchema` and `shapes`. Look at it with `pnpm stills ShapeGallery 60,150 1`; the last argument renders full size.
- An actor that should dim takes an optional `id` and reads `useDim(id)`.
- Every component has an entry in `docs/registry.tsx` with a demo in `docs/demos.tsx`.
- A `<Player>` that plays narration needs `numberOfSharedAudioTags={0}`, or it crashes on the sixth beat.
