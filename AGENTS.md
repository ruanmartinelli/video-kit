# video-kit

Narrated 3D explainer videos built from React components (Remotion + React Three Fiber). The kit is `src/kit/`, each video is `src/videos/<name>/`, the docs page is `docs/`.

`src/videos/load-balancer/` is the reference video. Copy its shape.

## Making a video

1. **Write the beat sheet.** `src/videos/<name>/script.json`: a voice and a list of beats, each `{ "id", "text" }`. A beat is one spoken sentence and one thing changing on screen. The video answers one question, opens on the problem, follows one concrete example through the system, and ends on what the solution costs. Done when you can say, for every beat, what moves on screen while it is spoken. A beat a still image could carry gets rewritten or cut.

2. **Narrate.** `pnpm narrate <name>` writes `narration.json` and one MP3 per beat. Unchanged beats are reused. When edge-tts returns no audio, the error says which of two things happened: it is throttling (run it again in a few minutes) or it rejects that sentence (split the beat in two or shorten it).

3. **Compose.** One file, `src/videos/<name>/<Name>.tsx`, registered in `src/Root.tsx`:
   - `createTimeline(narration)` gives `t`. Every animation starts at a cue: `t.at(beat)` or `t.at(beat, word)`.
   - `layoutGraph(...)` gives positions for a flow; `layoutHub(...)` for one thing with many dependents. Give each node the `shape` that names what it is (`database`, `server`, `queue`, `client`, `phone`, `user`, `cloud`, `external`, `storage`, `log`, `clock`, `notification` for systems; `router`, `controller`, `worker`, `trigger`, `agent`, `model`, `file`, `shield`, `key` for code); `service` is the plain box. Packets, extra pipes and camera targets all read `graph.position(id)`.
   - One `<World>`, one `<CameraRig>`, actors as children; `Narration`, `Caption` and every flat panel (`CodePanel`, `Tables`, `Chip`, ...) in `overlay`.

4. **Look at it.** `pnpm stills <CompositionId>` renders one frame per second to `out/stills/<CompositionId>/`; pass `120,340,515` to render chosen frames. Read the PNGs. Done when every still passes all of these:
   - the subject of the current beat is in frame and nothing stands in front of it
   - every label is whole and clear of other labels
   - captions and code are readable
   - something differs from the still before it

5. **Render.** `pnpm typecheck`, then `pnpm render <CompositionId> out/<name>.mp4`.

## Reviewing a PR

A review video shows what the reviewer has to look at and leaves the rest of the diff out. Each kind of change below has a reference video: copy the one that matches. Every one ends on the single thing the reviewer should check.

- Set `change` (`added`, `changed`, `removed`) on every node, table and column the PR touched, and on nothing else: color means this PR.
- Name the file on screen with a `Chip` for every hop whose code the narration talks about, so the viewer can check it against the diff.
- `Tables`, `Outcomes`, `Schedule`, `CodePanel` and a wide shot of the whole path each want the frame: show one at a time.
- A PR with more than one item opens on a `Manifest`: every item the video covers, changed behaviour before new surface, and a `footer` for what it leaves out. Then one section per item, in that order.

### Schema and data flow

`src/videos/pr-api-keys/`. Schema first, then one request followed from the client to the table rows it reads and writes.

- Tables are flat: `Tables` in `overlay`, with the database node beside it in the world. One beat per migration, with a `Chip` naming its file. Columns enter with `appear`.
- A query is a packet from the service to the database. The row it reads or writes pulses its `lit` on the frame the packet lands.

### Changed behaviour

`src/videos/pr-auth/`. When a PR changes what existing code answers (an auth check, a policy, tenant scoping), show the answers, since the diff alone does not.

- Pick the cases that matter: each role, each tenant, each kind of input. Five or fewer, and one of them is the case whose answer changed.
- Send every case through the changed node twice, as a `Packet` with a `label`: once as the base branch answers, once as the PR answers. A case that passes travels on; a case that is refused travels back to where it came from.
- `Outcomes` in `overlay` keeps score. Fill a row's `before` or `after` on the frame its packet reaches the node.
- A `Chip` says which run is on screen: `before this PR`, `with this PR`.
- The case whose answer changed goes last, in `danger`, and is followed all the way to what it now reaches. End on the lines of code that explain it.

### Shared code

`src/videos/pr-shared/`. A helper whose existing behaviour changed, with callers the PR did not touch.

- First what changed: one input and its old and new result, in `Outcomes` with `heading="input"`.
- Then who gets it: `layoutHub` with the helper in the middle and every caller around it. `change: "changed"` on the callers the PR updated, nothing on the rest.
- A `Ripple` leaves the helper. Each caller outside the PR lights in `danger` as the front reaches it.
- End on the outside caller where the new result does the most damage.

### New endpoint

`src/videos/pr-endpoint/`.

- A route is the `label` on a pipe that leaves the router, set through `Graph3D`'s `edges`. The new one is `tone: "added"`, to a controller with `change: "added"`.
- Whatever the existing routes pass on the way (auth, rate limiting) is a node in the graph, so a new route that skips it shows as a pipe that goes around.
- Follow one request down the new route to what it reads or writes.

### GraphQL

`src/videos/pr-graphql/`.

- The schema is `Tables` in `overlay`: one panel per type, named `type Mutation`, with `change: "added"` on each new field.
- A resolver is a `file` node between the GraphQL server and the database. Follow one query and let the viewer count the database packets it causes; a `Chip` in the top-right corner keeps the total.

### Jobs and schedules

`src/videos/pr-cron/`. A new worker, a new schedule entry, or a schedule whose interval changed. A changed body in an existing worker is ordinary code: leave it out.

- A job is a `worker` node. Draw everything that starts it: the `queue` it reads from, a `clock` for a schedule.
- A changed interval is two rows in `Schedule`, old and new, over the same window.

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
