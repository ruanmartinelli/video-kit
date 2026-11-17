import { Children, createContext, isValidElement, useContext, type ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { z } from "zod";
import "../kit/fonts";
import type { Graph } from "../kit/graph";
import { cameraRigSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { resolveCamera, type Camera } from "./camera";
import { assertFraming } from "./framing";

type CameraRigProps = z.input<typeof cameraRigSchema> & {
  /** The graph on stage, or several. With it every shot is checked once the camera has settled: labels that overlap throw, and the error says what to change. */
  graph?: Graph | Graph[];
};

/**
 * Directs the camera: give each shot what to keep in frame, and it pans and
 * zooms there. It draws nothing itself. World reads its props, so it is
 * written among World's children, not inside another component.
 */
export const CameraRig = (_: CameraRigProps) => null;

/** Half the width, in pixels, over which the scene fades out beside a docked panel. */
const FADE = 50;

const CameraContext = createContext<Camera | null>(null);

/** The camera for the frame being drawn. Every flat actor places itself with it. */
export const useCamera = () => {
  const camera = useContext(CameraContext);
  if (!camera) {
    throw new Error("This actor is outside a World. Flat actors are World's children.");
  }
  return camera;
};

const findRig = (children: ReactNode): CameraRigProps | null => {
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }
    if (child.type === CameraRig) {
      return child.props as CameraRigProps;
    }
    const inside = findRig((child.props as { children?: ReactNode }).children);
    if (inside) {
      return inside;
    }
  }
  return null;
};

type WorldProps = {
  /** Actors and a CameraRig. */
  children: ReactNode;
  /** Flat panels drawn on top of the scene: Narration, Caption, CodePanel. */
  overlay?: ReactNode;
};

/** The one flat space a video happens in: a grid the camera pans and zooms over. */
export const World = ({ children, overlay }: WorldProps) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const rig = findRig(children);
  if (!rig) {
    throw new Error("World needs a <CameraRig> among its children. Write it directly inside World, not inside a component of your own.");
  }
  const { shots, moveFrames } = cameraRigSchema.parse({ shots: rig.shots, moveFrames: rig.moveFrames, sway: rig.sway });
  if (rig.graph) {
    assertFraming(
      rig.shots,
      [rig.graph].flat().flatMap((graph) => graph.nodes),
      width,
      height,
    );
  }
  const camera = resolveCamera(shots, frame, moveFrames, width, height);
  const [originX, originY] = camera.point([0, 0, 0]);
  const docked = camera.left > 0 || camera.right < width;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* The floor's grid, one square per world unit. It moves with the camera, which is what makes a pan read as one. */}
          <pattern id="floor" width={camera.scale} height={camera.scale} patternUnits="userSpaceOnUse" x={originX} y={originY}>
            <path d={`M ${camera.scale} 0 H 0 V ${camera.scale}`} fill="none" stroke={theme.grid} strokeWidth={1.5} />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#floor)" />
        {/* Beside a docked panel the scene fades out before it reaches the panel, so nothing sits half under it. */}
        {docked ? (
          <defs>
            <linearGradient id="clear-fade" gradientUnits="userSpaceOnUse" x1={0} x2={width}>
              <stop offset={(camera.left - FADE) / width} stopColor="black" />
              <stop offset={(camera.left + FADE) / width} stopColor="white" />
              <stop offset={(camera.right - FADE) / width} stopColor="white" />
              <stop offset={(camera.right + FADE) / width} stopColor="black" />
            </linearGradient>
            <mask id="clear" maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
              <rect width={width} height={height} fill="url(#clear-fade)" />
            </mask>
          </defs>
        ) : null}
        <g mask={docked ? "url(#clear)" : undefined}>
          <CameraContext.Provider value={camera}>{children}</CameraContext.Provider>
        </g>
      </svg>
      <AbsoluteFill>{overlay}</AbsoluteFill>
    </AbsoluteFill>
  );
};
