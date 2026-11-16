// Render a video to an MP4.
//
// Usage: pnpm render <video folder>
//
// Writes <video folder>/out/<folder name>.mp4.

import { renderMedia, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromiumOptions, open, shown } from "./project.mjs";

const [target] = process.argv.slice(2);
const { serveUrl, id, out, dir } = target ? await open(target) : {};
if (!dir) {
  console.error("Usage: pnpm render <video folder>");
  process.exit(1);
}

const composition = await selectComposition({ serveUrl, id, chromiumOptions });
await mkdir(out, { recursive: true });
const outputLocation = path.join(out, `${path.basename(dir)}.mp4`);
let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation,
  chromiumOptions,
  onProgress: ({ progress }) => {
    const tenth = Math.floor(progress * 10);
    if (tenth > last) {
      last = tenth;
      console.log(`  ${tenth * 10}%`);
    }
  },
});
console.log(`${shown(outputLocation)}  ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);
