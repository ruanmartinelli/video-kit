import { ThreeCanvas } from "@remotion/three";
import type { ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import "./fonts";
import { theme } from "./theme";

export const CAMERA_FOV = 40;

type WorldProps = {
  /** 3D content: actors and a CameraRig. */
  children: ReactNode;
  /** Flat 2D content drawn on top of the scene: Narration, Caption, CodePanel. */
  overlay?: ReactNode;
};

/** The one 3D space a video happens in. */
export const World = ({ children, overlay }: WorldProps) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: CAMERA_FOV, position: [0, 7, 15] }}>
        <color attach="background" args={[theme.background]} />
        <fog attach="fog" args={[theme.background, 18, 55]} />
        <ambientLight intensity={theme.ambient} />
        <directionalLight position={[6, 10, 8]} intensity={theme.sun} />
        <directionalLight position={[-8, 4, -6]} intensity={0.6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[160, 160]} />
          <meshBasicMaterial color={theme.floor} toneMapped={false} />
        </mesh>
        <gridHelper args={[160, 160, theme.grid, theme.grid]} position={[0, 0.01, 0]} />
        {children}
      </ThreeCanvas>
      <AbsoluteFill>{overlay}</AbsoluteFill>
    </AbsoluteFill>
  );
};
