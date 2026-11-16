import { ThreeCanvas } from "@remotion/three";
import type { ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { theme } from "./theme";

type WorldProps = {
  /** 3D content: actors and a CameraRig. */
  children: ReactNode;
  /** Flat 2D content drawn on top of the scene, e.g. captions. */
  overlay?: ReactNode;
};

export const World = ({ children, overlay }: WorldProps) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 7, 15] }}>
        <color attach="background" args={[theme.background]} />
        <fog attach="fog" args={[theme.background, 16, 42]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 8]} intensity={2.2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 120]} />
          <meshStandardMaterial color={theme.floor} />
        </mesh>
        <gridHelper args={[120, 120, theme.grid, theme.grid]} position={[0, 0.01, 0]} />
        {children}
      </ThreeCanvas>
      <AbsoluteFill>{overlay}</AbsoluteFill>
    </AbsoluteFill>
  );
};
