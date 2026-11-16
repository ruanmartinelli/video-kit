// Render a storyboard: a few frames of a video on one sheet, with and without notes.
//
// Usage: pnpm storyboard <StoryboardCompositionId>
//
// The storyboard composition's props name the video and the frames. Writes
// out/storyboard/<Id>.png (clean) and out/storyboard/<Id>-notes.png.

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [id] = process.argv.slice(2);
if (!id) {
  console.error("Usage: pnpm storyboard <StoryboardCompositionId>");
  process.exit(1);
}

const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({
  entryPoint: path.join(root, "src/index.ts"),
  publicDir: path.join(root, "public"),
});

const board = await selectComposition({ serveUrl, id, chromiumOptions });
const { video, panels } = board.props;
if (typeof video !== "string" || !Array.isArray(panels)) {
  console.error(`"${id}" is not a storyboard: its props need \`video\` and \`panels\`.`);
  process.exit(1);
}

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

const dir = path.join(root, "out/storyboard");
await mkdir(dir, { recursive: true });
const inputProps = { ...board.props, images };
const sheet = await selectComposition({ serveUrl, id, inputProps, chromiumOptions });
for (const [frame, name] of [`${id}.png`, `${id}-notes.png`].entries()) {
  const output = path.join(dir, name);
  await renderStill({ composition: sheet, serveUrl, frame, inputProps, output, chromiumOptions });
  console.log(path.relative(root, output));
}
