---
name: video-kit
description: Make a narrated 3D explainer video from React components. Use when asked for a video that explains a pull request, a bug and its fix, a plan or rollout, or how a system works.
---

# Make a video with video-kit

video-kit turns a beat sheet into a narrated 3D video: one sentence per beat, one thing changing on screen per sentence.

The kit is the repository this skill lives in. Find it once with `cd -P "<this skill's directory>" && cd ../.. && pwd`. Every path and command below is relative to it, and the video is built there whichever repository the request came from.

## Where the video lives

- A video is a folder: `src/videos/<name>/`. Its MP4 goes to `out/<name>.mp4`; copy it to where the user asked.
- A video about code from another repository is **private**. Name its folder `private-<name>`: `src/videos/private-*/` and `public/narration/private-*/` are git-ignored, because this repository is public. Run no git command that changes state for a private video.
- `pnpm narrate` sends each sentence to an outside text-to-speech service. In a private video the narration names no customer and no person and holds no credential. Table, function and file names go on screen, where they stay local.

## Steps

1. **Read the reference for the kind of video.** A pull request: `references/pr-review.md`. A bug, a plan, a rollout or how a system works: `references/explaining.md`. Each names the reference video to copy and how that kind of video opens and ends.

2. **Write the beat sheet.** `src/videos/<name>/script.json`: a voice and a list of beats, each `{ "id", "text" }` (copy `src/videos/load-balancer/script.json`). A beat is one spoken sentence and one thing changing on screen. The video answers one question and follows one concrete example through the system. Done when you can say, for every beat, what moves on screen while it is spoken. A beat a still image could carry gets rewritten or cut.

3. **Narrate.** `pnpm narrate <name>` writes `narration.json` and one MP3 per beat. Unchanged beats are reused. The speech service throttles after a burst, and the script waits it out by itself, for minutes if it has to: let it run. If it still gives up, run it again later. Reword a beat only when it alone keeps failing while the beats after it go through.

4. **Compose.** Two files in the video's folder:
   - `<Name>.tsx`, the video. Copy the shape of the reference video your reference file names.
   - `video.ts`, which registers it (copy `src/videos/load-balancer/video.ts`). `src/Root.tsx` picks up every `video.ts` by itself.

   `references/pieces.md` lists every piece in one line each. Read `references/pieces/<id>.md` for the pieces you are about to use, all in one go: props, defaults and an example. That is the whole API; the kit's source is for changing the kit.
   - `createTimeline(narration)` gives `t`. Every animation starts at a cue: `t.at(beat)` or `t.at(beat, word)`.
   - `layoutGraph(...)` gives positions for a flow; `layoutHub(...)` for one thing with many dependents. Give each node the `shape` that names what it is; `pieces/shapes.md` lists them. Packets, extra pipes and camera targets all read `graph.position(id)`.
   - One `<World>`, one `<CameraRig graph={graph}>`, actors as children; `Narration`, `Caption` and every flat panel in `overlay`.
   - A shot with a docked panel on screen (`CodePanel`, `Outcomes`, `Tables`, `Meter`, ...) names the panel's side in `panel`, and the rig fits the targets into the rest of the frame. For a short panel over a wide path, the other way works too: leave `panel` out and `shift` the whole path down under it, as `pr-auth` does.

5. **Check it.** `pnpm typecheck`, then `pnpm stills <Id> cues --sheet`. That renders three frames per beat and tiles them twelve to an image, each under its frame number. Read every sheet.

   The kit has already done part of the looking: a label the frame edge would cut is hidden, and labels that would overlap stop the render with an error that says what to change. On the sheets you look for the rest:
   - the subject of the beat is in frame, and no panel covers it
   - every panel is whole inside the frame
   - each tile differs from the one before it

   For any tile that looks wrong, and for one frame of each panel that carries code or small text, render that frame full size and read it: `pnpm stills <Id> 612 1` writes `out/stills/<Id>/f0612.png`. Each run replaces what is in that folder. After a fix, re-render only the frames it touched: `pnpm stills <Id> 612,640 --sheet`.

   A packet is on screen for half a second, so two tiles a second apart can look the same while the packet between them is fine. Check a packet by rendering a frame inside its trip.

   Done when every tile passes and every panel with code has been read at full size.

6. **Render.** `pnpm render <Id> out/<name>.mp4`. Report the path, the length, and that the video was checked on stills: say plainly that it was not watched in motion or listened to.

## How the kit works

**One world.** A video is a single `World` the camera travels through. Change what the camera frames to move the story on; the scene itself stays.

**Motion is a function of the frame.** Read `useCurrentFrame()` and shape it with `ease`, `pulse` and `pop` from the kit. Remotion renders frames out of order and in parallel, so anything driven by a clock (R3F `useFrame` deltas, drei `<Float>`, physics) renders wrong.

**The camera frames targets.** A shot is `targets` plus a `view` and `azimuth`; `CameraRig` works out where to stand. When something blocks the subject, change `azimuth` or `view`. A node the shot does not target may sit half out of frame: its label hides, and it reads as background.

**One panel at a time.** Flat panels dock in the same place, on the side their `side` names. `Chip`, `Term` and the `Chapter` rail sit in the corners and can stay.

**Text.** 3D text goes through `Label`, which holds the render until the text is typeset; raw drei `<Text>` is missing from rendered frames. Sentences and code go in `overlay`, flat.

**Coordinates.** Node positions come from `layoutGraph`. Hand-written coordinates belong only inside a `Node`'s children, in its local 2 x 1.2 x 2 box.

**Errors are instructions.** Every piece parses its props with a Zod schema, and the layout and the camera check what they are given. An error at render names the prop or the shot and says what to change: do that, then render again.
