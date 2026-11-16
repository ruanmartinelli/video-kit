import { staticFile } from "remotion";

export const theme = {
  background: "#000000",
  floor: "#000000",
  grid: "#191919",
  surface: "#383838",
  dimmed: "#0d0d0d",
  /** Outline drawn around every shape, so grey reads against black. */
  edge: "#6e6e6e",
  neutral: "#ededed",
  accent: "#52a8ff",
  danger: "#ff4d4d",
  pipe: "#555555",
  text: "#ededed",
  textDim: "#7d7d7d",
  panel: "rgba(10, 10, 10, 0.92)",
  panelBorder: "#2e2e2e",
  sans: "Inter",
  mono: "JetBrains Mono",
  sansFile: () => staticFile("fonts/inter-600.woff"),
  monoFile: () => staticFile("fonts/jetbrains-mono-500.woff"),
};

export type Tone = "accent" | "danger";
