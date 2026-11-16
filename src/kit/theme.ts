import { staticFile } from "remotion";

const dark = {
  background: "#000000",
  floor: "#000000",
  grid: "#191919",
  surface: "#383838",
  /** What an actor fades to when Focus dims it. */
  dimmed: "#0d0d0d",
  /** Recesses: bays, screens, openings. */
  inset: "#0d0d0d",
  /** Outline drawn around every shape, so it reads against the background. */
  edge: "#6e6e6e",
  neutral: "#ededed",
  accent: "#52a8ff",
  danger: "#ff4d4d",
  pipe: "#555555",
  text: "#ededed",
  textDim: "#7d7d7d",
  panel: "rgba(10, 10, 10, 0.92)",
  panelBorder: "#2e2e2e",
  /** Shiki theme for CodePanel. */
  code: "vesper",
  /** How hard lit things glow. Light backgrounds wash out a strong glow. */
  glow: 1,
  ambient: 0.7,
  sun: 2.6,
};

/** Black shapes on a light stage. */
const light: typeof dark = {
  background: "#f4f4f4",
  floor: "#f4f4f4",
  grid: "#e2e2e2",
  surface: "#1c1c1c",
  dimmed: "#d2d2d2",
  inset: "#000000",
  edge: "#000000",
  neutral: "#171717",
  accent: "#14b8a6",
  danger: "#f43f5e",
  pipe: "#8f8f8f",
  text: "#171717",
  textDim: "#8f8f8f",
  panel: "rgba(255, 255, 255, 0.94)",
  panelBorder: "#e2e2e2",
  code: "github-light",
  glow: 0.45,
  ambient: 1.5,
  sun: 1.9,
};

export const themes = { dark, light };

/** The palette every component reads. Swap the key to change the look of every video. */
export const theme = {
  ...themes.light,
  sans: "Geist",
  mono: "Geist Mono",
  sansFile: () => staticFile("fonts/geist-600.woff"),
  monoFile: () => staticFile("fonts/geist-mono-500.woff"),
};

export type Tone = "accent" | "danger";
