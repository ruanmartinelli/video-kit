import { Billboard, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import { z } from "zod";
import { unitSchema, vec3Schema, type Vec3 } from "./motion";
import { theme } from "./theme";

export const labelSchema = z.object({
  position: vec3Schema.describe("Bottom-center of the text."),
  children: z.string().describe("The text. Keep it to a few words."),
  size: z.number().default(0.36).describe("Text height in world units."),
  opacity: unitSchema.default(1),
});

type LabelProps = z.input<typeof labelSchema>;

type TypeProps = {
  children: string;
  position?: Vec3;
  size: number;
  color?: string;
  opacity?: number;
  font?: "sans" | "mono";
  anchorX?: "left" | "center" | "right";
  anchorY?: "bottom" | "middle";
  /** Draw over whatever stands in front of it. For text that moves past other actors. */
  onTop?: boolean;
};

/**
 * Text in the 3D world, lying in its parent's plane. Kit components build on
 * this; videos use Label. It holds the render until the text is typeset.
 */
export const Type = ({ children, position, size, color = theme.text, opacity = 1, font = "sans", anchorX = "center", anchorY = "bottom", onTop = false }: TypeProps) => {
  const advance = useThree((state) => state.advance);
  // Text is typeset off-thread, after the frame was already drawn. Hold the
  // render until it lands, then draw the frame again. The hold starts in an
  // effect because the font load suspends, which throws away render-time state.
  const hold = useRef<number | null>(null);
  // Effects also re-run when anything else in the scene suspends. Text that is
  // already typeset never reports again, so a hold taken then would never release.
  const typeset = useRef<string | null>(null);
  const release = () => {
    if (hold.current !== null) {
      continueRender(hold.current);
      hold.current = null;
    }
  };
  useLayoutEffect(() => {
    if (typeset.current !== children) {
      hold.current = delayRender(`Typesetting "${children}"`);
    }
    return release;
  }, [children]);

  return (
    <Text
      position={position}
      font={font === "mono" ? theme.monoFile() : theme.sansFile()}
      fontSize={size}
      color={color}
      fillOpacity={opacity}
      anchorX={anchorX}
      anchorY={anchorY}
      renderOrder={onTop ? 10 : 0}
      material-depthTest={!onTop}
      onSync={() => {
        typeset.current = children;
        advance(performance.now());
        release();
      }}
    >
      {children}
    </Text>
  );
};

/** Short text in the 3D world that always faces the camera. */
export const Label = (props: LabelProps) => {
  const { position, children, size, opacity } = labelSchema.parse(props);

  return (
    <Billboard position={position}>
      <Type size={size} opacity={opacity}>
        {children}
      </Type>
    </Billboard>
  );
};
