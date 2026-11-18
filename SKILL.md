---
name: video-kit
description: Make a narrated 3D explainer video. Use when asked for a video that explains software, such as a pull request, a bug, a plan or a system.
---

# Make a video with video-kit

A video is a list of **beats**: one spoken sentence each, with something moving on screen while it is spoken. What the beats say, and in what order, is yours to decide. The kit supplies the pieces, the camera and the checks.

This folder is the kit. Run every command below from it. When it has no `node_modules`, run `pnpm install` first.

The video is a folder of its own, outside the kit: `videos/<name>/` in the project the request came from, or where the user says. Every command takes that folder's path and writes inside it: narration in `audio/`, stills and the MP4 in `out/`.

## Steps

1. **Write the beats.** Copy `template/Template.tsx`, `template/video.ts` and `template/script.json` into the video's folder, and rename the component and its `id`. `script.json` is a voice and the beats, each `{ "id", "text" }`. The template's own beats are a placeholder: replace all of them.

   `pnpm narrate` sends each sentence to an outside text-to-speech service, so the narration names no customer and no person and holds no credential. Table, function and file names go on screen, where they stay local.

   Done when you can say, for every beat, what moves on screen while it is spoken. A beat a still image could carry gets rewritten or cut.

2. **Narrate.** `pnpm narrate <folder>` writes `narration.json` and one MP3 per beat, reusing unchanged beats. The speech service throttles after a burst, and the script waits it out by itself, for minutes if it has to: let it run, and run it again later if it gives up. Reword a beat only when it alone keeps failing while the beats after it go through.

   Done when its last line counts every beat.

3. **Compose.** Grow `Template.tsx` into the video. Its code is the shape of every video: a timeline, the cues named once, a graph, one `World` with one `CameraRig`, actors in the world and panels in `overlay`.

   `references/pieces.md` lists every piece and what it draws, one line each. Read `references/pieces/<id>.md` for every piece you use, all in one go: props, defaults and an example. Every video uses `timeline`, `motion`, `graph`, `camera-rig`, `node`, `shapes` and `packet`. Those pages are the whole API; the kit's source is for changing the kit.

   Done when `pnpm check <folder>` prints `No type errors.`

4. **Check it.** `pnpm stills <folder> cues --sheet` renders three frames per beat and tiles them twelve to an image, each under its frame number, in `<folder>/out/stills/`. Read every sheet.

   The kit has already done part of the looking: a node label the frame edge would cut is hidden, and two node labels that would overlap stop the render with an error that says what to change. On the sheets you look for the rest:
   - the subject of the beat is in frame, and no panel covers it
   - every panel is whole inside the frame
   - each tile differs from the one before it
   - every node label is clear: no other node, `Chip`, `Gate` rule, `Callout` or packet label sits on it
   - every `Callout` is whole inside the frame

   For any tile that looks wrong, and for one frame of each panel that carries code or small text, render that frame full size and read it: `pnpm stills <folder> 612 1` writes `out/stills/f0612.png`. Each run replaces what is in that folder. After a fix, re-render only the frames it touched: `pnpm stills <folder> 612,640 --sheet`.

   A packet is on screen for half a second, so two tiles a second apart can look the same while the packet between them is fine. Check a packet by rendering a frame inside its trip.

   Done when every tile passes and every panel with code has been read at full size.

5. **Render.** `pnpm render <folder>` writes `<folder>/out/<name>.mp4`. Report the path, the length, and that the video was checked on stills: say plainly that it was not watched in motion or listened to.

Asked for a storyboard, a few frames of the finished video on one sheet: `references/pieces/storyboard.md`.

## How the kit works

**One world.** A video is a single `World` the camera travels through. The scene stays; what the camera frames changes.

**Motion is a function of the frame.** Read `useCurrentFrame()` and shape it with the helpers on the `motion` page, each starting at a cue from the timeline. Frames are rendered out of order and in parallel, so anything driven by a clock (R3F `useFrame` deltas, drei `<Float>`, physics) renders wrong.

**The camera frames targets.** A shot is `targets` plus a `view` and `azimuth`; `CameraRig` works out where to stand. A column's nodes stand one behind the other, so from the front a near node covers the label of the one behind it: raise `elevation` or turn `azimuth` until each is clear. A node the shot does not target may sit half out of frame: its label hides, and it reads as background.

**One panel at a time.** Flat panels dock in the same place, on the side their `side` names. The shot names that side in `panel`, and the rig fits the targets into the rest of the frame. `Chip`, `Term` and the `Chapter` rail sit in the corners and can stay. While a panel is up, wrap the graph in `Focus` on its subject, so what is behind the panel dims. A wide shot of the whole path wants the frame as much as a panel does: show one or the other.

**Text.** 3D text goes through `Label`, which holds the render until the text is typeset; raw drei `<Text>` is missing from rendered frames. Sentences and code go in `overlay`, flat.

**Coordinates.** Node positions come from `layoutGraph` or `layoutHub`, and packets, extra pipes and camera targets read `graph.position(id)`. Hand-written coordinates belong only inside a `Node`'s children, in its local 2 x 1.2 x 2 box.

**Errors are instructions.** Every piece parses its props with a Zod schema, and the layout and the camera check what they are given. An error at render names the prop or the shot and says what to change: do that, then render again.
