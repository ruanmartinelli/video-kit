import { Line } from "@react-three/drei";
import type { Vec3 } from "./motion";
import { theme } from "./theme";

type PipeProps = {
  from: Vec3;
  to: Vec3;
};

export const Pipe = ({ from, to }: PipeProps) => (
  <Line points={[from, to]} color={theme.pipe} lineWidth={3} />
);
