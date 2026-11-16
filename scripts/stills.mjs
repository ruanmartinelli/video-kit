// Render still frames of a composition so you can look at them.
//
// Usage: pnpm stills <CompositionId> [frame,frame,...] [scale]
//
// With no frames given, renders one frame per second. Writes PNGs to
// out/stills/<CompositionId>/f<frame>.png, half size unless a scale is given.

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [id, frameList, scale = "0.5"] = process.argv.slice(2);
if (!id) {
  console.error("Usage: pnpm stills <CompositionId> [frame,frame,...] [scale]");
  process.exit(1);
}

const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  publicDir: path.join(root, "public"),
});
const composition = await selectComposition({ serveUrl, id, chromiumOptions });

const frames = frameList
  ? frameList.split(",").map(Number)
  : Array.from(
      { length: Math.ceil(composition.durationInFrames / composition.fps) },
      (_, second) => second * composition.fps,
    );

const dir = path.join(root, "out/stills", id);
await rm(dir, { recursive: true, force: true });
await mkdir(dir, { recursive: true });

for (const frame of frames) {
  const output = path.join(dir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, frame, output, scale: Number(scale), chromiumOptions });
  console.log(path.relative(root, output));
}
