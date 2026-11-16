import { z } from "zod";
import type { PropRow } from "./registry";

type JsonSchema = {
  type?: string;
  enum?: unknown[];
  items?: JsonSchema | false;
  prefixItems?: JsonSchema[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  default?: unknown;
  description?: string;
  minimum?: number;
  maximum?: number;
};

const typeOf = (schema: JsonSchema): string => {
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
    const fields = Object.entries(schema.properties ?? {}).map(([key, value]) => `${key}: ${typeOf(value)}`);
    return `{ ${fields.join("; ")} }`;
  }
  if (schema.type === "integer") {
    return "number";
  }
  if (schema.type === "number" && schema.minimum !== undefined && schema.maximum !== undefined) {
    return `number ${schema.minimum}–${schema.maximum}`;
  }
  return schema.type ?? "unknown";
};

const rowsOf = (schema: z.ZodType) => {
  const json = z.toJSONSchema(schema, { io: "input" }) as JsonSchema;
  const required = new Set(json.required ?? []);
  return Object.entries(json.properties ?? {}).map(([name, prop]) => ({
    name,
    required: required.has(name),
    type: typeOf(prop),
    fallback: prop.default === undefined ? "" : JSON.stringify(prop.default),
    description: prop.description ?? "",
  }));
};

export const SchemaTable = ({ title, schema }: { title: string; schema: z.ZodType }) => (
  <table className="props">
    <caption>{title}</caption>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {rowsOf(schema).map((row) => (
        <tr key={row.name}>
          <td>
            <code>{row.name}</code>
            {row.required ? <span className="required">required</span> : null}
          </td>
          <td>
            <code>{row.type}</code>
          </td>
          <td>{row.fallback ? <code>{row.fallback}</code> : null}</td>
          <td>{row.description}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const OtherPropsTable = ({ rows }: { rows: PropRow[] }) => (
  <table className="props">
    <tbody>
      {rows.map((row) => (
        <tr key={row.name}>
          <td>
            <code>{row.name}</code>
          </td>
          <td>
            <code>{row.type}</code>
          </td>
          <td />
          <td>{row.description}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
