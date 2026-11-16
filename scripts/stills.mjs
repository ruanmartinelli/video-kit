// Render still frames of a composition so you can look at them.
//
// Usage: pnpm stills <CompositionId> [cues | frame,frame,...] [scale] [--sheet]
//
//   cues     the frames worth looking at: three per narrated beat, and the last one
//   --sheet  also tile the stills twelve to an image, each under its frame number
//
// With no frames given, renders one frame per second. Writes PNGs to
// out/stills/<CompositionId>/f<frame>.png (half size unless a scale is given)
// and sheets to out/stills/<CompositionId>/sheet-<n>.png.

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const sheet = args.includes("--sheet");
const [id, frameList, scale = "0.5"] = args.filter((arg) => !arg.startsWith("--"));
if (!id) {
  console.error("Usage: pnpm stills <CompositionId> [cues | frame,frame,...] [scale] [--sheet]");
  process.exit(1);
}

const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  publicDir: path.join(root, "public"),
});
const composition = await selectComposition({ serveUrl, id, chromiumOptions });

const cueFrames = async () => {
  const { props } = await selectComposition({ serveUrl, id: "Cues", chromiumOptions });
  const frames = props.cues[id];
  if (!frames) {
    console.error(`"${id}" has no cues. Cues come from a video's timeline: it needs a src/videos/<name>/video.ts.`);
    process.exit(1);
  }
  return frames;
};

const frames =
  frameList === "cues"
    ? await cueFrames()
    : frameList
      ? frameList.split(",").map(Number)
      : Array.from({ length: Math.ceil(composition.durationInFrames / composition.fps) }, (_, second) => second * composition.fps);

const dir = path.join(root, "out/stills", id);
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

const name = (frame) => `f${String(frame).padStart(4, "0")}.png`;
for (const frame of frames) {
  const output = path.join(dir, name(frame));
  await renderStill({ composition, serveUrl, frame, output, scale: Number(scale), chromiumOptions });
  if (!sheet) {
    console.log(path.relative(root, output));
  }
}

if (sheet) {
  // The sheet is a still of its own. It finds the frames in the bundle's public folder.
  const TILES = 12;
  await mkdir(path.join(serveUrl, "public/sheet"), { recursive: true });
  for (let first = 0; first < frames.length; first += TILES) {
    const batch = frames.slice(first, first + TILES);
    const images = [];
    for (const frame of batch) {
      const image = `sheet/${id}-${name(frame)}`;
      await copyFile(path.join(dir, name(frame)), path.join(serveUrl, "public", image));
      images.push(image);
    }
    const labels = batch.map((frame) => `f${frame}  ${(frame / composition.fps).toFixed(1)}s`);
    const inputProps = { images, labels };
    const sheetComposition = await selectComposition({ serveUrl, id: "Sheet", inputProps, chromiumOptions });
    const output = path.join(dir, `sheet-${String(first / TILES + 1).padStart(2, "0")}.png`);
    await renderStill({ composition: sheetComposition, serveUrl, inputProps, output, chromiumOptions });
    console.log(path.relative(root, output));
  }
  console.log(`${frames.length} frames. Full-size frames are beside the sheets: ${path.relative(root, dir)}/f<frame>.png`);
}
