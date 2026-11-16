// Typecheck a video.
//
// Usage: pnpm check <video folder>

import { spawnSync } from "node:child_process";
import path from "node:path";
import { kit, resolveVideo, tsconfigFor } from "./project.mjs";

const [target] = process.argv.slice(2);
const dir = target ? resolveVideo(target) : null;
if (!dir) {
  console.error("Usage: pnpm check <video folder>   (the folder that holds video.ts)");
  process.exit(1);
}

const { status } = spawnSync(path.join(kit, "node_modules/.bin/tsc"), ["--noEmit", "-p", await tsconfigFor(dir)], { stdio: "inherit" });
if (status === 0) {
  console.log("No type errors.");
}
process.exit(status ?? 1);
