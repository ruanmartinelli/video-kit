// Write the kit's reference for agents from the registry of pieces.
//
// Usage: pnpm kit:api
//
// Writes references/pieces.md (one line per piece) and
// references/pieces/<id>.md (props and an example).

import { build } from "esbuild";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "references");

// The registry is TypeScript that imports the kit, so it is compiled first. Packages stay as they are.
const compiled = path.join(root, ".cache/registry.mjs");
await build({ entryPoints: [path.join(root, "src/registry.ts")], outfile: compiled, bundle: true, packages: "external", platform: "node", format: "esm", jsx: "automatic", logLevel: "error" });
const { entries } = await import(pathToFileURL(compiled).href);

const typeOf = (schema) => {
  if (schema.enum) {
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  }
  if (schema.prefixItems) {
    const numeric = schema.prefixItems.every((item) => item.type === "number");
    return numeric && schema.prefixItems.length === 3 ? "Vec3" : `[${schema.prefixItems.map(typeOf).join(", ")}]`;
  }
  if (schema.type === "array" && schema.items) {
    const item = typeOf(schema.items);
    return item.includes(" ") ? `(${item})[]` : `${item}[]`;
  }
  if (schema.type === "object") {
    return `{ ${Object.entries(schema.properties ?? {}).map(([key, value]) => `${key}: ${typeOf(value)}`).join("; ")} }`;
  }
  if (schema.type === "integer") {
    return "number";
  }
  if (schema.type === "number" && schema.minimum !== undefined && schema.maximum !== undefined) {
    return `number ${schema.minimum}–${schema.maximum}`;
  }
  return schema.type ?? "unknown";
};

/** A Zod schema as prop rows. */
const rowsOf = (schema) => {
  const json = z.toJSONSchema(schema, { io: "input" });
  const required = new Set(json.required ?? []);
  return Object.entries(json.properties ?? {}).map(([name, prop]) => ({
    name,
    required: required.has(name),
    type: typeOf(prop),
    fallback: prop.default === undefined ? "" : JSON.stringify(prop.default),
    description: prop.description ?? "",
  }));
};

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
  "Written by `pnpm kit:api` from `src/registry.ts`. Edit the registry, not this file.",
  "",
  "Each piece has its props and an example in `pieces/<id>.md`. Read the ones you are about to use.",
  ...groups.flatMap((group) => ["", `## ${group}`, "", ...entries.filter((entry) => entry.group === group).map((entry) => `- \`${entry.id}\` **${entry.name}**: ${firstSentence(entry.summary)}`)]),
  "",
].join("\n");
await writeFile(path.join(out, "pieces.md"), index);
console.log(`${entries.length} pieces written to ${path.relative(root, out)}`);
