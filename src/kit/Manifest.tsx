import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const manifestItemSchema = z.object({
  kind: z.string().describe("What sort of thing it is, in the reviewer's words: `Auth`, `Shared code`, `New endpoint`."),
  name: z.string().describe("The thing itself, as it is written in the code: `requireAdmin`, `POST /api-keys`."),
  change: z.enum(["added", "changed", "removed"]).describe("changed: existing behaviour moved. added: new surface. removed: something callers had is gone."),
  note: z.string().optional().describe("The one fact that sizes it: `8 callers, 5 outside this PR`."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Stagger the rows with ease()."),
});

export const manifestSchema = z.object({
  items: z.array(manifestItemSchema).min(1).describe("What the video covers, riskiest first: changed behaviour before new surface. Six or fewer."),
  title: z.string().default("What to look at in this PR"),
  footer: z.string().optional().describe("What the video leaves out, so the viewer knows it was a choice: `31 other files: ordinary changes, not shown`."),
  current: z.number().int().min(0).optional().describe("Index of the item the video covers next. The rest dim. Set it when the manifest comes back between sections."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type ManifestProps = z.input<typeof manifestSchema>;

/**
 * The opening card of a PR review with more than one thing in it: every item
 * the video covers, in the order it covers them. Goes in World's `overlay`,
 * over a wide shot of the system.
 */
export const Manifest = (props: ManifestProps) => {
  const { items, title, footer, current, appear } = manifestSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const dim = { fontFamily: theme.sans, fontWeight: 600, color: theme.textDim };

  return (
    // A veil over the scene: the system stays visible behind the list, but its labels stop competing with it.
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        opacity: appear,
        background: `color-mix(in srgb, ${theme.background} 78%, transparent)`,
      }}
    >
      <div style={{ ...dim, fontSize: 30, marginBottom: 10 }}>{title}</div>
      {items.map((item, index) => (
        <div
          key={`${item.kind} ${item.name}`}
          style={{
            width: 1120,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "20px 30px",
            borderRadius: 14,
            background: theme.panel,
            border: `2px solid ${theme.panelBorder}`,
            opacity: item.appear * (current === undefined || current === index ? 1 : 0.35),
            transform: `translateY(${(1 - item.appear) * 16}px)`,
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: 8, flexShrink: 0, background: theme[item.change] }} />
          <span style={{ width: 250, flexShrink: 0, fontFamily: theme.sans, fontWeight: 600, fontSize: 34, color: theme.text }}>{item.kind}</span>
          <span style={{ fontFamily: theme.mono, fontWeight: 500, fontSize: 28, color: theme[item.change] }}>{item.name}</span>
          {item.note ? <span style={{ ...dim, marginLeft: "auto", fontSize: 24 }}>{item.note}</span> : null}
        </div>
      ))}
      {footer ? <div style={{ ...dim, fontSize: 26, marginTop: 12 }}>{footer}</div> : null}
    </div>
  );
};
