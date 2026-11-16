import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const recordFieldSchema = z.object({
  name: z.string().describe("The field as the code spells it: `status`, `reserved_at`."),
  value: z.string().describe("Its value now. With `was` set, the value it changes to."),
  was: z.string().optional().describe("The value before the change. Set it on the field that changes; leave it off on the rest."),
  flip: unitSchema
    .default(1)
    .describe("With `was` set: 0 shows the old value, 1 shows it struck through with the new value beside it in the changed colour. Drive with ease()."),
  lit: unitSchema.default(0).describe("Highlights the row: the field a query reads or a check looks at. Drive with pulse()."),
});

export const recordCardSchema = z.object({
  title: z.string().describe("Which record: `order 1042`."),
  caption: z.string().optional().describe("Small text above the title that says what kind of thing it is: `record`, `event payload`."),
  fields: z.array(recordFieldSchema).min(1).max(6).describe("The fields the narration talks about, not the whole row. Six or fewer."),
  side: z.enum(["left", "right"]).default("right").describe("Pair with the CameraRig shot's `shift` to move the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type RecordCardProps = z.input<typeof recordCardSchema>;

const NAME = 230;

/**
 * One record as a card: a few fields, one of which flips from its old value
 * to its new one. Also the payload an event carries. Goes in World's `overlay`.
 */
export const RecordCard = (props: RecordCardProps) => {
  const { title, caption, fields, side, appear } = recordCardSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const slide = (1 - appear) * (side === "right" ? 60 : -60);

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        minWidth: 620,
        borderRadius: 14,
        overflow: "hidden",
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      <div style={{ padding: "18px 28px", borderBottom: `2px solid ${theme.panelBorder}` }}>
        {caption ? <div style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 22, color: theme.textDim, marginBottom: 4 }}>{caption}</div> : null}
        <div style={{ fontSize: 28, color: theme.text }}>{title}</div>
      </div>
      <div style={{ padding: "8px 0" }}>
        {fields.map((field) => {
          const flip = field.was === undefined ? 1 : field.flip;
          return (
            <div
              key={field.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "13px 28px",
                fontSize: 26,
                background: `color-mix(in srgb, ${theme.accent} ${14 * field.lit}%, transparent)`,
                boxShadow: `inset ${5 * field.lit}px 0 0 ${theme.accent}`,
              }}
            >
              <span style={{ width: NAME, flexShrink: 0, color: theme.textDim }}>{field.name}</span>
              {field.was === undefined ? (
                <span style={{ color: theme.text, whiteSpace: "nowrap" }}>{field.value}</span>
              ) : (
                // Both values are always laid out, so the card keeps its size while the field flips.
                <span style={{ display: "flex", alignItems: "center", gap: 22, whiteSpace: "nowrap" }}>
                  <span style={{ position: "relative", color: `color-mix(in srgb, ${theme.textDim} ${100 * flip}%, ${theme.text})` }}>
                    {field.was}
                    <span
                      style={{
                        position: "absolute",
                        left: -3,
                        top: "52%",
                        height: 3,
                        width: `calc(${100 * flip}% + ${6 * flip}px)`,
                        background: theme.textDim,
                        opacity: Math.min(1, flip * 10),
                      }}
                    />
                  </span>
                  <span style={{ color: theme.changed, opacity: flip, transform: `translateX(${(1 - flip) * -12}px)` }}>{field.value}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
