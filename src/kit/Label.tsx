import { Billboard, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import type { Vec3 } from "./motion";
import { theme } from "./theme";

type LabelProps = {
  position: Vec3;
  children: string;
  size?: number;
};

/** Text that always faces the camera. */
export const Label = ({ position, children, size = 0.36 }: LabelProps) => {
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
        font={theme.font()}
        fontSize={size}
        color={theme.text}
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
