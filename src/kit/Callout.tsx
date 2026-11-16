import { Billboard, Line } from "@react-three/drei";
import { z } from "zod";
import { useDim } from "./Focus";
import { Type } from "./Label";
import { unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const calloutSchema = z.object({
  id: z.string().optional().describe("Name used by Focus to keep this callout lit."),
  at: vec3Schema.describe("The point it is about. A small dot marks it."),
  children: z.string().describe("The note. A few words."),
  offset: z
    .tuple([z.number(), z.number()])
    .default([1.6, 1.8])
    .describe("Where the note sits from `at`, in world units on screen: [right, up]. A negative right puts it on the left."),
  tone: z.enum(["neutral", "accent", "danger"]).default("neutral").describe("neutral for a remark; accent or danger to tie it to what is lit."),
  appear: unitSchema.default(1).describe("0 = hidden. The line grows out of `at` over the first half, then the note comes in. Drive with ease()."),
});

type CalloutProps = z.input<typeof calloutSchema>;

const SIZE = 0.34;
const DOT_RADIUS = 0.09;
/** Width of a Geist Mono character, as a share of its size. */
const CHAR_WIDTH = 0.6;
const PAD = 0.14;

/** A note tied to a point in the world by a leader line. Faces the camera, and draws over whatever stands in front of it. */
export const Callout = (props: CalloutProps) => {
  const { id, at, children, offset, tone, appear } = calloutSchema.parse(props);
  const dim = useDim(id);

  if (appear <= 0) {
    return null;
  }

  const [right, up] = offset;
  const grow = Math.min(1, appear * 2);
  const reveal = Math.max(0, appear * 2 - 1);
  const fade = 1 - 0.75 * dim;
  const color = tone === "neutral" ? theme.textDim : theme[tone];
  const textColor = tone === "neutral" ? theme.text : theme[tone];
  const side = right < 0 ? -1 : 1;
  const width = children.length * SIZE * CHAR_WIDTH + 2 * PAD;
  const height = SIZE + 2 * PAD;

  return (
    // Everything lives in the billboard's plane, so `offset` is on screen whatever the camera does.
    <Billboard position={at}>
      <mesh renderOrder={8}>
        <circleGeometry args={[DOT_RADIUS * Math.min(1, appear * 4), 24]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={fade} depthTest={false} />
      </mesh>
      <Line
        points={[
          [0, 0, 0],
          [right * grow, up * grow, 0],
        ]}
        color={color}
        lineWidth={2}
        transparent
        opacity={fade}
        depthTest={false}
        renderOrder={8}
      />
      {reveal > 0 ? (
        <group position={[right, up, 0]}>
          {/* The note starts where the line ends and reads away from `at`. */}
          <mesh position={[(side * width) / 2, 0, 0]} renderOrder={9}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color={theme.background} toneMapped={false} transparent opacity={0.9 * reveal * fade} depthTest={false} />
          </mesh>
          <Type
            position={[side * PAD, 0, 0]}
            size={SIZE}
            font="mono"
            anchorX={side < 0 ? "right" : "left"}
            anchorY="middle"
            color={textColor}
            opacity={reveal * fade}
            onTop
          >
            {children}
          </Type>
        </group>
      ) : null}
    </Billboard>
  );
};
