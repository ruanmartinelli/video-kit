import { Line } from "@react-three/drei";
import { z } from "zod";
import { useDim } from "./Focus";
import { span } from "./geometry";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const pipeSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this pipe lit."),
  from: vec3Schema.describe("Center of the node it leaves."),
  to: vec3Schema.describe("Center of the node it reaches."),
  progress: unitSchema.default(1).describe("How much of the pipe is drawn, growing out of `from`. 0 hides it."),
});

type PipeProps = z.input<typeof pipeSchema>;

/** A connection between two nodes. */
export const Pipe = (props: PipeProps) => {
  const { id, from, to, progress } = pipeSchema.parse(props);
  const dim = useDim(id);

  if (progress <= 0) {
    return null;
  }

  const [start, end] = span(from, to);

  return (
    <Line
      points={[start, lerp3(start, end, progress)]}
      color={theme.pipe}
      lineWidth={3}
      transparent
      opacity={1 - 0.75 * dim}
    />
  );
};
