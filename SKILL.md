---
name: video-kit
description: Make a narrated 3D explainer video from React components. Use when asked for a video that explains a pull request, a bug and its fix, a plan or rollout, or how a system works.
---

# Make a video with video-kit

video-kit turns a beat sheet into a narrated 3D video: one sentence per beat, one thing changing on screen per sentence.

This folder is the kit. Run every command below from it (`cd` to this skill's directory). On first use, when it has no `node_modules`, run `pnpm install` once.

## Where the video lives

A video is a folder of its own, outside the kit: by default `videos/<name>/` in the project the request came from, or wherever the user says. Commands take that folder's path, and everything a command writes lands inside it: narration in `audio/`, stills and the MP4 in `out/`.

- The video belongs to that project. Commit it only when the user asks.
- `pnpm narrate` sends each sentence to an outside text-to-speech service. The narration names no customer and no person and holds no credential. Table, function and file names go on screen, where they stay local.

## Steps

1. **Read the reference for the kind of video.** A pull request: `references/pr-review.md`. A bug, a plan, a rollout or how a system works: `references/explaining.md`. Each says how that kind of video opens and ends and which pieces carry it.

2. **Start from the template and write the beat sheet.** Copy `template/Template.tsx`, `template/video.ts` and `template/script.json` into the video's folder, and rename the component and its `id`. `script.json` is a voice and a list of beats, each `{ "id", "text" }`. A beat is one spoken sentence and one thing changing on screen. The video answers one question and follows one concrete example through the system. Done when you can say, for every beat, what moves on screen while it is spoken. A beat a still image could carry gets rewritten or cut.

3. **Narrate.** `pnpm narrate <folder>` writes `narration.json` and one MP3 per beat. Unchanged beats are reused. The speech service throttles after a burst, and the script waits it out by itself, for minutes if it has to: let it run. If it still gives up, run it again later. Reword a beat only when it alone keeps failing while the beats after it go through.

4. **Compose.** `Template.tsx` is a whole small video and the shape of every bigger one: a timeline, the cues named once, a graph, one `World` with one `CameraRig`, actors in the world and panels in `overlay`. Grow it into yours.

   `references/pieces.md` lists every piece in one line each. Read `references/pieces/<id>.md` for the pieces you are about to use, all in one go: props, defaults and an example. That is the whole API; the kit's source is for changing the kit.
   - Everything is imported from `video-kit`.
   - `createTimeline(narration)` gives `t`. Every animation starts at a cue: `t.at(beat)` or `t.at(beat, word)`.
   - `between(frame, from, to)` is 1 while something is on screen, for a panel's `appear`. `hop(frame, start)` is a packet's `progress` for a trip that starts at a cue. `pulse(frame, at)` lights a node on the frame something reaches it.
   - `layoutGraph(...)` gives positions for a flow; `layoutHub(...)` for one thing with many dependents. Give each node the `shape` that names what it is; `pieces/shapes.md` lists them. Packets, extra pipes and camera targets all read `graph.position(id)`.
   - A `CodePanel` is as wide as its longest line, and `panel` leaves room for about 60 characters of code. Keep lines under that, or give the shot a `shift` of your own.
   - A shot with a docked panel on screen (`CodePanel`, `Outcomes`, `Tables`, `Meter`, ...) names the panel's side in `panel`, and the rig fits the targets into the rest of the frame. For a short panel over a wide path, the other way works too: leave `panel` out and `shift` the whole path down under it.

5. **Check it.** `pnpm check <folder>` typechecks it. Then `pnpm stills <folder> cues --sheet` renders three frames per beat and tiles them twelve to an image, each under its frame number, in `<folder>/out/stills/`. Read every sheet.

   The kit has already done part of the looking: a node label the frame edge would cut is hidden, and two node labels that would overlap stop the render with an error that says what to change. That covers node labels only. On the sheets you look for the rest:
   - the subject of the beat is in frame, and no panel covers it
   - every panel is whole inside the frame
   - each tile differs from the one before it
   - no `Chip`, `Gate` rule, `Callout` or packet label sits on a node label, and no `Callout` runs off the frame

   For any tile that looks wrong, and for one frame of each panel that carries code or small text, render that frame full size and read it: `pnpm stills <folder> 612 1` writes `out/stills/f0612.png`. Each run replaces what is in that folder. After a fix, re-render only the frames it touched: `pnpm stills <folder> 612,640 --sheet`.

   A packet is on screen for half a second, so two tiles a second apart can look the same while the packet between them is fine. Check a packet by rendering a frame inside its trip.

   Done when every tile passes and every panel with code has been read at full size.

6. **Render.** `pnpm render <folder>` writes `<folder>/out/<name>.mp4`. Report the path, the length, and that the video was checked on stills: say plainly that it was not watched in motion or listened to.

## How the kit works

**One world.** A video is a single `World` the camera travels through. Change what the camera frames to move the story on; the scene itself stays.

**Motion is a function of the frame.** Read `useCurrentFrame()` and shape it with `ease`, `pulse`, `pop`, `between` and `hop` from the kit. Frames are rendered out of order and in parallel, so anything driven by a clock (R3F `useFrame` deltas, drei `<Float>`, physics) renders wrong.

**The camera frames targets.** A shot is `targets` plus a `view` and `azimuth`; `CameraRig` works out where to stand. When something blocks the subject, change `azimuth` or `view`. A node the shot does not target may sit half out of frame: its label hides, and it reads as background.

**One panel at a time.** Flat panels dock in the same place, on the side their `side` names. `Chip`, `Term` and the `Chapter` rail sit in the corners and can stay. While a panel is up, wrap the graph in `Focus` on its subject, so what is behind the panel dims.

**Text.** 3D text goes through `Label`, which holds the render until the text is typeset; raw drei `<Text>` is missing from rendered frames. Sentences and code go in `overlay`, flat.

**Coordinates.** Node positions come from `layoutGraph`. Hand-written coordinates belong only inside a `Node`'s children, in its local 2 x 1.2 x 2 box.

**Errors are instructions.** Every piece parses its props with a Zod schema, and the layout and the camera check what they are given. An error at render names the prop or the shot and says what to change: do that, then render again.
