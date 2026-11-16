import { Billboard, Line } from "@react-three/drei";
import { z } from "zod";
import { useDim } from "./Focus";
import { span } from "./geometry";
import { Type } from "./Label";
import { lerp3, unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const pipeSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this pipe lit."),
  from: vec3Schema.describe("Center of the node it leaves."),
  to: vec3Schema.describe("Center of the node it reaches."),
  clear: z
    .tuple([z.number().min(0), z.number().min(0)])
    .optional()
    .describe("Distance to stay clear of `from` and `to`. Defaults to a node's edge."),
  tone: z.enum(["neutral", "added", "changed", "removed"]).default("neutral").describe("neutral is a plain connection; the rest mark what a PR did to it."),
  progress: unitSchema.default(1).describe("How much of the pipe is drawn, growing out of `from`. 0 hides it."),
  label: z.string().optional().describe("What travels on it, under its middle: a route, a topic, a query name. Comes in with `progress`."),
});

type PipeProps = z.input<typeof pipeSchema>;

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
          <Type size={0.32} font="mono" color={tone === "neutral" ? theme.textDim : theme[tone]} opacity={Math.max(0, 2 * progress - 1) * (1 - 0.75 * dim)} onTop>
            {label}
          </Type>
        </Billboard>
      ) : null}
    </>
  );
};
