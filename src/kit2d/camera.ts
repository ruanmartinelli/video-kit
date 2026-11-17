import { shotSchema, type Shot } from "../kit/camera";
import { ease, lerp, type Vec3 } from "../kit/motion";

/** Where the flat world sits on the frame: world units to pixels. */
export type Camera = {
  /** Pixels per world unit. */
  scale: number;
  width: number;
  height: number;
  /** The part of the frame's width the world is seen in: a docked panel takes the rest. */
  left: number;
  right: number;
  /** A world position as a point on the frame. The world's x runs right and its z runs down the screen. */
  point: (position: Vec3) => [number, number];
};

/** The parts of the frame the subject keeps out of: chips along the top, the caption along the bottom, and a margin at the sides. */
const SAFE = { top: 170, bottom: 250, side: 96 };
/** Share of the frame's width a docked panel takes, with its margin. */
const PANEL_SHARE = 0.45;
/** Room around a target, in world units: its plate, and its label above. */
const ROOM = { across: 1.9, above: 2, below: 1.3 };
/**
 * How much of the world's depth shows on a flat frame. The layouts space rows
 * for a 3D view, where a label needs room in front of the node behind it. Flat,
 * that room is wasted, so rows sit closer and a graph fills more of the frame.
 */
export const DEPTH = 0.62;
/** A single node never fills the frame. */
const MAX_SCALE = 150;

type Pose = { centerX: number; centerY: number; screenX: number; screenY: number; scale: number; left: number; right: number };

/** Where a shot puts the world: its targets fill the part of the frame nothing else is using. */
export const poseOf = (input: Shot, width: number, height: number): Pose => {
  const shot = shotSchema.parse(input);
  const xs = shot.targets.map((target) => target[0]);
  const ys = shot.targets.map((target) => target[2] * DEPTH);
  const box = {
    left: Math.min(...xs) - ROOM.across,
    right: Math.max(...xs) + ROOM.across,
    top: Math.min(...ys) - ROOM.above,
    bottom: Math.max(...ys) + ROOM.below,
  };

  const free = {
    left: shot.panel === "left" ? width * PANEL_SHARE : SAFE.side,
    right: shot.panel === "right" ? width * (1 - PANEL_SHARE) : width - SAFE.side,
    top: SAFE.top,
    bottom: height - SAFE.bottom,
  };
  const fit = Math.min((free.right - free.left) / (box.right - box.left), (free.bottom - free.top) / (box.bottom - box.top));
  const [right, up] = shot.shift ?? [0, 0];

  return {
    centerX: (box.left + box.right) / 2,
    centerY: (box.top + box.bottom) / 2,
    screenX: (free.left + free.right) / 2 + right * width,
    screenY: (free.top + free.bottom) / 2 - up * height,
    scale: Math.min(MAX_SCALE, fit / (shot.padding ?? 1)),
    left: shot.panel === "left" ? free.left : 0,
    right: shot.panel === "right" ? free.right : width,
  };
};

const cameraAt = (pose: Pose, width: number, height: number): Camera => ({
  scale: pose.scale,
  width,
  height,
  left: pose.left,
  right: pose.right,
  point: (position) => [(position[0] - pose.centerX) * pose.scale + pose.screenX, (position[2] * DEPTH - pose.centerY) * pose.scale + pose.screenY],
});

/** The camera once it has settled on a shot. */
export const settled = (shot: Shot, width: number, height: number) => cameraAt(poseOf(shot, width, height), width, height);

/** The camera on a given frame: it eases from each shot to the next, panning and zooming. */
export const resolveCamera = (shots: Shot[], frame: number, moveFrames: number, width: number, height: number): Camera => {
  const [first, ...rest] = shots;
  if (!first) {
    throw new Error("CameraRig needs at least one shot");
  }
  let pose = poseOf(first, width, height);
  for (const shot of rest) {
    const next = poseOf(shot, width, height);
    const t = ease(frame, shot.at, shot.at + moveFrames);
    pose = {
      centerX: lerp(pose.centerX, next.centerX, t),
      centerY: lerp(pose.centerY, next.centerY, t),
      screenX: lerp(pose.screenX, next.screenX, t),
      screenY: lerp(pose.screenY, next.screenY, t),
      // Zoom is felt in ratios, so it eases in ratios.
      scale: Math.exp(lerp(Math.log(pose.scale), Math.log(next.scale), t)),
      left: lerp(pose.left, next.left, t),
      right: lerp(pose.right, next.right, t),
    };
  }
  return cameraAt(pose, width, height);
};
