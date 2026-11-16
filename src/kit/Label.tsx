import { Billboard, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import { z } from "zod";
import { unitSchema, vec3Schema } from "./motion";
import { theme } from "./theme";

export const labelSchema = z.object({
  position: vec3Schema.describe("Bottom-center of the text."),
  children: z.string().describe("The text. Keep it to a few words."),
  size: z.number().default(0.36).describe("Text height in world units."),
  opacity: unitSchema.default(1),
});

type LabelProps = z.input<typeof labelSchema>;

/** Short text in the 3D world that always faces the camera. */
export const Label = (props: LabelProps) => {
  const { position, children, size, opacity } = labelSchema.parse(props);
  const advance = useThree((state) => state.advance);
  // Text is typeset off-thread, after the frame was already drawn. Hold the
  // render until it lands, then draw the frame again. The hold starts in an
  // effect because the font load suspends, which throws away render-time state.
  const hold = useRef<number | null>(null);
  const release = () => {
    if (hold.current !== null) {
      continueRender(hold.current);
      hold.current = null;
    }
  };
  useLayoutEffect(() => {
    hold.current = delayRender(`Typesetting label "${children}"`);
    return release;
  }, [children]);

  return (
    <Billboard position={position}>
      <Text
        font={theme.sansFile()}
        fontSize={size}
        color={theme.text}
        fillOpacity={opacity}
        anchorX="center"
        anchorY="bottom"
        onSync={() => {
          advance(performance.now());
          release();
        }}
      >
        {children}
      </Text>
    </Billboard>
  );
};
