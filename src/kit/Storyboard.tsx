import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import "./fonts";
import { theme } from "./theme";

export const storyboardPanelSchema = z.object({
  frame: z.number().int().min(0).describe("The frame of the video this panel shows. Use a cue: `t.at(beat, word)`."),
  note: z.string().describe("What to say over this panel. One or two sentences."),
});

export const storyboardSchema = z.object({
  video: z.string().describe("Id of the composition the panels are taken from. The kit fills this in."),
  panels: z.array(storyboardPanelSchema).min(1).max(6).describe("The moments worth talking over, in order. Three or four is a storyboard; six is the limit."),
  size: z.tuple([z.number().positive(), z.number().positive()]).default([1920, 1080]).describe("Width and height of that video."),
  images: z.array(z.string()).default([]).describe("One rendered frame per panel. `pnpm storyboard` fills this in; leave it out."),
});

export type StoryboardProps = z.input<typeof storyboardSchema>;

const WIDTH = 3840;
const MARGIN = 80;
const GAP = 48;
const NOTES = 300;

const panelWidth = (count: number) => (WIDTH - 2 * MARGIN - (count - 1) * GAP) / count;

/** What the storyboard's own composition is registered with. Frame 0 is the clean sheet, frame 1 has the notes. */
export const storyboardMeta = (id: string, board: StoryboardProps) => {
  const { panels, size } = storyboardSchema.parse(board);
  return { id, fps: 30, width: WIDTH, height: Math.round(2 * MARGIN + (panelWidth(panels.length) * size[1]) / size[0] + NOTES), durationInFrames: 2 };
};

/**
 * A few frames of a video side by side on one sheet, for presenting it
 * yourself. A video asks for one with `board` in its `video.ts`;
 * `pnpm storyboard <folder>` writes the clean sheet and the one with notes.
 */
export const Storyboard = (props: StoryboardProps) => {
  const { panels, size, images } = storyboardSchema.parse(props);
  const withNotes = useCurrentFrame() >= 1;
  const width = panelWidth(panels.length);

  return (
    <AbsoluteFill style={{ background: theme.background, padding: MARGIN, flexDirection: "row", gap: GAP }}>
      {panels.map((panel, index) => {
        const image = images[index];
        return (
          <div key={index} style={{ width, display: "flex", flexDirection: "column", gap: 28 }}>
            <div
              style={{
                width,
                height: (width * size[1]) / size[0],
                boxSizing: "border-box",
                borderRadius: 18,
                overflow: "hidden",
                border: `3px solid ${theme.panelBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: theme.mono,
                fontWeight: 500,
                fontSize: 34,
                color: theme.textDim,
              }}
            >
              {image ? <Img src={staticFile(image)} style={{ width: "100%", height: "100%" }} /> : `frame ${panel.frame}`}
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", fontFamily: theme.sans, opacity: withNotes ? 1 : 0 }}>
              <span
                style={{
                  flex: "none",
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.text,
                  color: theme.background,
                  fontFamily: theme.mono,
                  fontWeight: 500,
                  fontSize: 34,
                }}
              >
                {index + 1}
              </span>
              <span style={{ fontWeight: 600, fontSize: 38, lineHeight: 1.35, color: theme.text }}>{panel.note}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
