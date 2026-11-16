import { staticFile } from "remotion";

export const theme = {
  background: "#0a0f1e",
  floor: "#0e1530",
  grid: "#1c2750",
  surface: "#3b4a8c",
  accent: "#5eead4",
  pipe: "#5b6bb5",
  text: "#f1f5ff",
  textDim: "#6b7699",
  font: () => staticFile("fonts/inter-600.woff"),
};
