// Render a storyboard: a few frames of a video on one sheet, with and without notes.
//
// Usage: pnpm storyboard <video folder>
//
// The video's video.ts names the frames and notes in `board`. Writes
// <video folder>/out/storyboard.png (clean) and storyboard-notes.png.

import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromiumOptions, open, shown } from "./project.mjs";

const [target] = process.argv.slice(2);
const { serveUrl, id: video, out, dir: folder } = target ? await open(target) : {};
if (!folder) {
  console.error("Usage: pnpm storyboard <video folder>");
  process.exit(1);
}

const id = `${video}Board`;
const board = await selectComposition({ serveUrl, id, chromiumOptions }).catch(() => null);
if (!board) {
  console.error(`"${video}" has no storyboard. Add \`board\` to its video.ts: the frames and a note for each.`);
  process.exit(1);
}
const { panels } = board.props;

// The panels are written into the bundle's own public folder, where the sheet finds them with staticFile().
const composition = await selectComposition({ serveUrl, id: video, chromiumOptions });
const images = [];
for (const [index, panel] of panels.entries()) {
  if (panel.frame >= composition.durationInFrames) {
    console.error(`Panel ${index + 1} asks for frame ${panel.frame}, but "${video}" has ${composition.durationInFrames} frames.`);
    process.exit(1);
  }
  const image = `storyboard/${id}-${index}.png`;
  await renderStill({ composition, serveUrl, frame: panel.frame, output: path.join(serveUrl, "public", image), chromiumOptions });
  images.push(image);
}

await mkdir(out, { recursive: true });
const inputProps = { ...board.props, images };
const sheet = await selectComposition({ serveUrl, id, inputProps, chromiumOptions });
for (const [frame, name] of ["storyboard.png", "storyboard-notes.png"].entries()) {
  const output = path.join(out, name);
  await renderStill({ composition: sheet, serveUrl, frame, inputProps, output, chromiumOptions });
  console.log(shown(output));
}
