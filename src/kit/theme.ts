import { staticFile } from "remotion";

export const theme = {
  background: "#0a0f1e",
  floor: "#0e1530",
  grid: "#1c2750",
  surface: "#3b4a8c",
  dimmed: "#171f3f",
  accent: "#5eead4",
  danger: "#fb5a6f",
  pipe: "#5b6bb5",
  text: "#f1f5ff",
  textDim: "#6b7699",
  panel: "rgba(10, 15, 30, 0.86)",
  panelBorder: "#2a376b",
  sans: "Inter",
  mono: "JetBrains Mono",
  sansFile: () => staticFile("fonts/inter-600.woff"),
  monoFile: () => staticFile("fonts/jetbrains-mono-500.woff"),
};

export type Tone = "accent" | "danger";
