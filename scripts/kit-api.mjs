// Write the kit's reference for agents from the same registry the docs page renders.
//
// Usage: pnpm kit:api
//
// Writes skills/video-kit/references/pieces.md (one line per piece) and
// skills/video-kit/references/pieces/<id>.md (props and an example).

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "skills/video-kit/references");

// The registry is TSX that imports the kit, so it is loaded the way the docs build loads it.
const server = await createServer({ configFile: path.join(root, "docs/vite.config.ts"), server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const { entries } = await server.ssrLoadModule("/registry.tsx");
const { rowsOf } = await server.ssrLoadModule("/PropsTable.tsx");
await server.close();

const firstSentence = (text) => text.match(/^.*?\.(?=\s|$)/)?.[0] ?? text;
const propLine = (row) => `- \`${row.name}\` ${row.type}${row.required ? ", required" : row.fallback ? ` = ${row.fallback}` : ""}${row.description ? `. ${row.description}` : ""}`;

const page = (entry) =>
  [
    `# ${entry.name}`,
    "",
    entry.summary,
    ...(entry.schemas ?? []).flatMap(({ title, schema }) => ["", `## ${title}`, "", ...rowsOf(schema).map(propLine)]),
    ...(entry.otherProps ? ["", "## Also", "", ...entry.otherProps.map((row) => `- \`${row.name}\` ${row.type}. ${row.description}`)] : []),
    "",
    "## Example",
    "",
    "```tsx",
    entry.code,
    "```",
    "",
  ].join("\n");

await rm(path.join(out, "pieces"), { recursive: true, force: true });
await mkdir(path.join(out, "pieces"), { recursive: true });
for (const entry of entries) {
  await writeFile(path.join(out, "pieces", `${entry.id}.md`), page(entry));
}

const groups = [...new Set(entries.map((entry) => entry.group))];
const index = [
  "# Pieces",
  "",
  "Written by `pnpm kit:api` from `docs/registry.tsx`. Edit the registry, not this file.",
  "",
  "Each piece has its props and an example in `pieces/<id>.md`. Read the ones you are about to use.",
  ...groups.flatMap((group) => ["", `## ${group}`, "", ...entries.filter((entry) => entry.group === group).map((entry) => `- \`${entry.id}\` **${entry.name}**: ${firstSentence(entry.summary)}`)]),
  "",
].join("\n");
await writeFile(path.join(out, "pieces.md"), index);
console.log(`${entries.length} pieces written to ${path.relative(root, out)}`);
