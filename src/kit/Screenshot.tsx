import { Img, staticFile } from "remotion";
import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const highlightSchema = z.object({
  x: unitSchema.describe("Left edge of the box, as a share of the image width."),
  y: unitSchema.describe("Top edge of the box, as a share of the image height."),
  width: unitSchema.describe("Width of the box, as a share of the image width."),
  height: unitSchema.describe("Height of the box, as a share of the image height."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

export const screenshotSchema = z.object({
  src: z.string().describe("The screen: a path under public/ (`demo/app-before.svg`, no leading slash) or an absolute http(s) URL."),
  after: z.string().optional().describe("The same screen after the change, same kind of path. `wipe` moves between the two."),
  wipe: unitSchema
    .default(0)
    .describe("0 shows all of `src`, 1 all of `after`; in between, a line sweeps left to right with `after` behind it. Drive with ease()."),
  highlight: highlightSchema.optional().describe("An outlined box around the part of the screen the narration is about."),
  url: z.string().optional().describe("Text for the address bar: `app.example.com/orders`."),
  width: z
    .number()
    .min(400)
    .max(1600)
    .default(1100)
    .describe(
      "Width of the frame in px. The height follows the image: a 16:10 screen at 1100 ends just above the captions, so go wider only for a short, wide screen.",
    ),
  side: z
    .enum(["left", "right", "center"])
    .default("center")
    .describe("center for a screen that wants the frame; left or right to keep a 3D subject beside it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type ScreenshotProps = z.input<typeof screenshotSchema>;

const resolve = (path: string) => (/^https?:\/\//.test(path) ? path : staticFile(path));

const BAR = 52;

/**
 * An app screen in a browser frame, with a box around what matters and a wipe
 * to the screen after the change. Goes in World's `overlay`.
 */
export const Screenshot = (props: ScreenshotProps) => {
  const { src, after, wipe, highlight, url, width, side, appear } = screenshotSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const shown = after ? wipe : 0;
  const place =
    side === "center"
      ? { left: "50%", transform: `translateX(-50%) translateY(${(1 - appear) * 30}px)` }
      : { [side]: 96, transform: `translateX(${(1 - appear) * (side === "right" ? 60 : -60)}px)` };
  const layer = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "left top" } as const;

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        ...place,
        width,
        borderRadius: 14,
        overflow: "hidden",
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
      }}
    >
      <div style={{ height: BAR, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `2px solid ${theme.panelBorder}` }}>
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            style={{ width: 14, height: 14, borderRadius: 7, background: theme.panelBorder, border: `2px solid ${theme.textDim}`, opacity: 0.6 }}
          />
        ))}
        {url ? (
          <span
            style={{
              marginLeft: 18,
              flex: 1,
              padding: "5px 16px",
              borderRadius: 8,
              background: `color-mix(in srgb, ${theme.textDim} 12%, transparent)`,
              fontFamily: theme.mono,
              fontWeight: 500,
              fontSize: 20,
              color: theme.textDim,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
          </span>
        ) : null}
      </div>
      <div style={{ position: "relative" }}>
        {/* The first image sets the height; `after` is clipped over it. */}
        <Img src={resolve(src)} style={{ display: "block", width: "100%" }} />
        {after ? <Img src={resolve(after)} style={{ ...layer, clipPath: `inset(0 ${(1 - shown) * 100}% 0 0)` }} /> : null}
        {shown > 0 && shown < 1 ? (
          <span style={{ position: "absolute", top: 0, bottom: 0, left: `${shown * 100}%`, width: 4, marginLeft: -2, background: theme.accent }} />
        ) : null}
        {highlight && highlight.appear > 0 ? (
          <span
            style={{
              position: "absolute",
              left: `${highlight.x * 100}%`,
              top: `${highlight.y * 100}%`,
              width: `${highlight.width * 100}%`,
              height: `${highlight.height * 100}%`,
              boxSizing: "border-box",
              border: `5px solid ${theme.accent}`,
              borderRadius: 10,
              opacity: highlight.appear,
              transform: `scale(${1.06 - 0.06 * highlight.appear})`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
