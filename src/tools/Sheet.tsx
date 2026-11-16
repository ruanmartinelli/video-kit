import { AbsoluteFill, Img, staticFile } from "remotion";
import { theme } from "../kit";

const COLUMNS = 4;
const ROWS = 3;
const TILE: [number, number] = [480, 270];
const GAP = 8;
const LABEL = 26;

export const SHEET_TILES = COLUMNS * ROWS;

export type SheetProps = { images: string[]; labels: string[] };

const heightFor = (tiles: number) => Math.max(1, Math.ceil(tiles / COLUMNS)) * (TILE[1] + LABEL + GAP) + GAP;

export const sheetMeta = {
  id: "Sheet",
  fps: 30,
  width: COLUMNS * TILE[0] + (COLUMNS + 1) * GAP,
  height: heightFor(SHEET_TILES),
  durationInFrames: 1,
  // A sheet that is not full is only as tall as its rows.
  calculateMetadata: ({ props }: { props: SheetProps }) => ({ height: heightFor(props.images.length) }),
};

/** A contact sheet: up to twelve stills on one image, each under its frame number. `pnpm stills <folder> cues --sheet` fills it in. */
export const Sheet = ({ images, labels }: SheetProps) => (
  <AbsoluteFill style={{ background: theme.text, padding: GAP, display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", gap: GAP }}>
    {images.map((image, index) => (
      <div key={image} style={{ width: TILE[0] }}>
        <div style={{ height: LABEL, lineHeight: `${LABEL}px`, fontFamily: theme.mono, fontWeight: 500, fontSize: 18, color: theme.background }}>
          {labels[index]}
        </div>
        <Img src={staticFile(image)} style={{ display: "block", width: TILE[0], height: TILE[1] }} />
      </div>
    ))}
  </AbsoluteFill>
);
