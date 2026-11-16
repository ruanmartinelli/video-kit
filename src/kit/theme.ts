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

const light: typeof dark = {
  background: "#f7f7f7",
  floor: "#f7f7f7",
  grid: "#e6e6e6",
  surface: "#ffffff",
  dimmed: "#eeeeee",
  inset: "#1c1c1c",
  edge: "#a3a3a3",
  neutral: "#171717",
  accent: "#0070f3",
  danger: "#e5484d",
  pipe: "#b0b0b0",
  text: "#171717",
  textDim: "#8f8f8f",
  panel: "rgba(255, 255, 255, 0.94)",
  panelBorder: "#e2e2e2",
  code: "github-light",
  glow: 0.3,
  ambient: 1.5,
  sun: 1.9,
};

/** The dark shapes on a charcoal stage instead of a black one. */
const charcoal: typeof dark = {
  ...dark,
  background: "#1b1b1b",
  floor: "#1b1b1b",
  grid: "#292929",
  surface: "#3d3d3d",
  dimmed: "#222222",
  inset: "#0a0a0a",
  edge: "#808080",
  pipe: "#6a6a6a",
  panel: "rgba(14, 14, 14, 0.94)",
  panelBorder: "#3a3a3a",
};

/** The dark shapes on a light stage. */
const contrast: typeof dark = {
  ...light,
  surface: "#2e2e2e",
  dimmed: "#c9c9c9",
  inset: "#0d0d0d",
  edge: "#111111",
  pipe: "#8a8a8a",
  glow: 1,
};

/** Colored shapes on a light stage. */
const daylight: typeof dark = {
  ...light,
  surface: "#3b4a8c",
  dimmed: "#cfd3e0",
  inset: "#141a36",
  edge: "#232c5c",
  pipe: "#6f7fc4",
  accent: "#14b8a6",
  danger: "#f43f5e",
  glow: 1,
};

export const themes = { dark, light, charcoal, contrast, daylight };

/** The palette every component reads. Swap the key to change the look of every video. */
export const theme = {
  ...themes.daylight,
  sans: "Inter",
  mono: "JetBrains Mono",
  sansFile: () => staticFile("fonts/inter-600.woff"),
  monoFile: () => staticFile("fonts/jetbrains-mono-500.woff"),
};

export type Tone = "accent" | "danger";
