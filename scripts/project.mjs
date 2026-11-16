// What every script shares: find the video, bundle it, and say where its output goes.
//
// A video is a folder anywhere on disk with a `video.ts` in it. It is not part
// of the kit, so the bundle gets an entry file written for it, and the folder
// gets a tsconfig that lets it import the kit and the kit's packages.

import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";
import { existsSync } from "node:fs";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const chromiumOptions = { gl: "angle" };

/** Paths are given from where the command was typed, not from the kit. */
const from = process.env.INIT_CWD ?? process.cwd();
export const resolveVideo = (argument) => {
  const dir = path.resolve(from, argument);
  return existsSync(path.join(dir, "video.ts")) ? dir : null;
};

const cacheFor = async (dir) => {
  const cache = path.join(kit, ".cache", `${path.basename(dir)}-${createHash("sha1").update(dir).digest("hex").slice(0, 8)}`);
  await mkdir(cache, { recursive: true });
  return cache;
};

/** A tsconfig for a video outside the kit: `video-kit` is the kit, and every package comes from the kit's node_modules. */
export const tsconfigFor = async (dir) => {
  const cache = await cacheFor(dir);
  const file = path.join(cache, "tsconfig.json");
  const modules = path.join(kit, "node_modules");
  await writeFile(
    file,
    JSON.stringify(
      {
        extends: path.join(kit, "tsconfig.json"),
        compilerOptions: {
          paths: { "video-kit": [path.join(kit, "src/kit/index.ts")], "*": [path.join(modules, "@types/*"), path.join(modules, "*")] },
          typeRoots: [path.join(modules, "@types")],
        },
        include: [dir],
        exclude: [path.join(dir, "out")],
      },
      null,
      2,
    ),
  );
  return file;
};

const withKit = (config) => ({
  ...config,
  resolve: { ...config.resolve, alias: { ...config.resolve?.alias, "video-kit": path.join(kit, "src/kit/index.ts") }, modules: [path.join(kit, "node_modules"), "node_modules"] },
});

/**
 * Bundles a video folder, or the kit alone when `argument` is not one (a
 * gallery's composition id). Returns where it is served from, the composition
 * id, and the folder its output belongs in.
 */
export const open = async (argument) => {
  const dir = resolveVideo(argument);
  if (!dir) {
    const serveUrl = await bundle({ entryPoint: path.join(kit, "src/index.ts"), publicDir: path.join(kit, "public"), webpackOverride: withKit });
    return { serveUrl, id: argument, out: path.join(kit, "out"), dir: null };
  }

  const name = path.basename(dir);
  const entryPoint = path.join(await cacheFor(dir), "entry.tsx");
  await writeFile(
    entryPoint,
    [
      `import { registerRoot } from "remotion";`,
      `import { makeRoot } from ${JSON.stringify(path.join(kit, "src/Root"))};`,
      `import { video } from ${JSON.stringify(path.join(dir, "video"))};`,
      ``,
      `registerRoot(makeRoot([video]));`,
      ``,
    ].join("\n"),
  );
  const serveUrl = await bundle({ entryPoint, publicDir: path.join(kit, "public"), webpackOverride: withKit });

  // Narration audio lives with the video. The bundle serves it from where narration.json says it is.
  if (existsSync(path.join(dir, "audio"))) {
    await mkdir(path.join(serveUrl, "public/narration"), { recursive: true });
    await cp(path.join(dir, "audio"), path.join(serveUrl, "public/narration", name), { recursive: true });
  }

  const { props } = await selectComposition({ serveUrl, id: "Cues", chromiumOptions });
  const [id] = Object.keys(props.cues);
  return { serveUrl, id, out: path.join(dir, "out"), dir };
};

/** How a path reads to whoever ran the command. */
export const shown = (file) => path.relative(from, file) || ".";
