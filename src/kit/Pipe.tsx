import { Billboard, Line } from "@react-three/drei";
import { z } from "zod";
import { useDim } from "./Focus";
import { span } from "./geometry";
import { Type } from "./Label";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";
import { pipeSchema } from "./schemas";

export { pipeSchema };

type PipeProps = z.input<typeof pipeSchema>;

/** What a video sets on a pipe that Graph3D draws. */
export type PipeState = Pick<PipeProps, "progress" | "tone" | "label">;

const LABEL_DROP = 0.52;

/** A connection between two nodes. */
export const Pipe = (props: PipeProps) => {
  const { id, from, to, clear, tone, progress, label } = pipeSchema.parse(props);
  const dim = useDim(id);

  if (progress <= 0) {
    return null;
  }

  const [start, end] = span(from, to, clear);
  const [x, y, z] = lerp3(start, end, 0.5);
  // A pipe that runs toward or away from the viewer slants on screen. Hang the label from the end that keeps it off the line.
  const run = end[0] - start[0];
  const slant = (end[2] - start[2]) * Math.sign(run || 1);
  const anchorX = Math.abs(slant) < 0.15 * Math.abs(run) ? "center" : slant > 0 ? "right" : "left";

  return (
    <>
      <Line
        points={[start, lerp3(start, end, progress)]}
        color={tone === "neutral" ? theme.pipe : theme[tone]}
        lineWidth={2.5}
        transparent
        opacity={1 - 0.75 * dim}
      />
      {label ? (
        // Under the line: packets and their labels own the space above it.
        <Billboard position={[x, y - LABEL_DROP, z]}>
          <Type
            size={0.38}
            font="mono"
            anchorX={anchorX}
            color={tone === "neutral" ? theme.textDim : theme[tone]}
            opacity={Math.max(0, 2 * progress - 1) * (1 - 0.75 * dim)}
            onTop
          >
            {label}
          </Type>
        </Billboard>
      ) : null}
    </>
  );
};
