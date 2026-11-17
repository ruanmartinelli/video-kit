import { Children, createContext, isValidElement, useContext, type ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { z } from "zod";
import "../kit/fonts";
import type { Graph } from "../kit/graph";
import { cameraRigSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { resolveCamera, type Camera } from "./camera";
import { assertFraming } from "./framing";
import { keyOf } from "./metrics";

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
const PANEL_FADE = 50;
/** Half the width over which it fades out at the edge of the frame. Targets sit further in than this. */
const EDGE_FADE = 70;

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
  const nodes = rig.graph ? [rig.graph].flat().flatMap((graph) => graph.nodes) : [];
  if (rig.graph) {
    assertFraming(rig.shots, nodes, width, height);
  }
  const camera = resolveCamera(shots, frame, moveFrames, width, height, new Map(nodes.map((node) => [keyOf(node.position), node.label])));
  const [originX, originY] = camera.point([0, 0, 0]);
  // The scene fades out toward whatever bounds it: a docked panel, or the edge of the frame. A node the shot does not
  // target then leaves softly, where a hard cut through its plate would read as a mistake.
  const fade = (edge: number, inward: 1 | -1) =>
    edge <= 0 || edge >= width ? [edge, edge + inward * 2 * EDGE_FADE] : [edge - inward * PANEL_FADE, edge + inward * PANEL_FADE];
  const [leftOut, leftIn] = fade(camera.left, 1) as [number, number];
  const [rightOut, rightIn] = fade(camera.right, -1) as [number, number];

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
        <defs>
          <linearGradient id="clear-fade" gradientUnits="userSpaceOnUse" x1={0} x2={width}>
            <stop offset={leftOut / width} stopColor="black" />
            <stop offset={leftIn / width} stopColor="white" />
            <stop offset={rightIn / width} stopColor="white" />
            <stop offset={rightOut / width} stopColor="black" />
          </linearGradient>
          <mask id="clear" maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
            <rect width={width} height={height} fill="url(#clear-fade)" />
          </mask>
        </defs>
        <g mask="url(#clear)">
          <CameraContext.Provider value={camera}>{children}</CameraContext.Provider>
        </g>
      </svg>
      <AbsoluteFill>{overlay}</AbsoluteFill>
    </AbsoluteFill>
  );
};
