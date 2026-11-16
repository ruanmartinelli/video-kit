import { z } from "zod";
import { ease, lerp, lerp3, vec3Schema, type Vec3 } from "./motion";

/** Named camera angles. Elevation is degrees above the floor; padding is breathing room around the targets. */
export const views = {
  wide: { elevation: 36, padding: 1.1 },
  close: { elevation: 22, padding: 1 },
  low: { elevation: 9, padding: 1.1 },
  top: { elevation: 72, padding: 1.1 },
} as const;

export const shotSchema = z.object({
  at: z.number().describe("Frame at which the camera starts moving to this shot."),
  targets: z.array(vec3Schema).min(1).describe("Points to keep in frame. The camera fits all of them."),
  view: z.enum(["wide", "close", "low", "top"]).default("wide").describe("Named angle."),
  azimuth: z.number().default(0).describe("Degrees around the targets. 0 is front-on, positive swings right."),
  elevation: z.number().optional().describe("Degrees above the floor. Overrides the view's."),
  padding: z.number().optional().describe("Zoom. 1 is tight, 2 is twice as far. Overrides the view's."),
  shift: z
    .tuple([z.number(), z.number()])
    .default([0, 0.07])
    .describe("Slide the subject on screen, as a fraction of the frame: [right, up]. Makes room for overlays."),
});

export type Shot = z.input<typeof shotSchema>;

type Pose = { center: Vec3; azimuth: number; elevation: number; distance: number; shift: [number, number] };

/** Room around a target point for its node and label. */
const TARGET_MARGIN = 1.9;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Unit vectors for a camera angle: from the targets toward the camera, and the camera's own right and up. */
const basis = (azimuthDegrees: number, elevationDegrees: number) => {
  const azimuth = toRadians(azimuthDegrees);
  const elevation = toRadians(elevationDegrees);
  const out: Vec3 = [Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)];
  const right: Vec3 = [Math.cos(azimuth), 0, -Math.sin(azimuth)];
  const up: Vec3 = [-Math.sin(azimuth) * Math.sin(elevation), Math.cos(elevation), -Math.cos(azimuth) * Math.sin(elevation)];
  return { out, right, up };
};

const poseOf = (input: Shot, fov: number, aspect: number): Pose => {
  const shot = shotSchema.parse(input);
  const view = views[shot.view];
  const elevation = shot.elevation ?? view.elevation;

  const axis = (i: 0 | 1 | 2) => shot.targets.map((t) => t[i]);
  const mid = (values: number[]) => (Math.min(...values) + Math.max(...values)) / 2;
  const center: Vec3 = [mid(axis(0)), mid(axis(1)), mid(axis(2))];

  // The closest the camera can stand, from this angle, with every target inside the frame.
  const { out, right, up } = basis(shot.azimuth, elevation);
  const tanVertical = Math.tan(toRadians(fov / 2));
  const tanHorizontal = tanVertical * aspect;
  const fit = Math.max(
    ...shot.targets.map((target) => {
      const offset: Vec3 = [target[0] - center[0], target[1] - center[1], target[2] - center[2]];
      const across = (Math.abs(dot(offset, right)) + TARGET_MARGIN) / tanHorizontal;
      const upward = (Math.abs(dot(offset, up)) + TARGET_MARGIN) / tanVertical;
      return Math.max(across, upward) + dot(offset, out);
    }),
  );

  return {
    center,
    azimuth: shot.azimuth,
    elevation,
    distance: fit * (shot.padding ?? view.padding),
    shift: shot.shift,
  };
};

type CameraInput = {
  shots: Shot[];
  frame: number;
  fps: number;
  fov: number;
  aspect: number;
  moveFrames: number;
  /** Degrees of slow side-to-side drift, so no frame is frozen. */
  sway: number;
};

const SWAY_PERIOD_SECONDS = 14;

/** Where the camera is and what it looks at on a given frame. */
export const resolveCamera = ({ shots, frame, fps, fov, aspect, moveFrames, sway }: CameraInput) => {
  const [first, ...rest] = shots;
  if (!first) {
    throw new Error("CameraRig needs at least one shot");
  }

  let pose = poseOf(first, fov, aspect);
  for (const shot of rest) {
    const next = poseOf(shot, fov, aspect);
    const t = ease(frame, shot.at, shot.at + moveFrames);
    pose = {
      center: lerp3(pose.center, next.center, t),
      azimuth: lerp(pose.azimuth, next.azimuth, t),
      elevation: lerp(pose.elevation, next.elevation, t),
      distance: lerp(pose.distance, next.distance, t),
      shift: [lerp(pose.shift[0], next.shift[0], t), lerp(pose.shift[1], next.shift[1], t)],
    };
  }

  const drift = sway * Math.sin((2 * Math.PI * frame) / (fps * SWAY_PERIOD_SECONDS));
  const { out, right, up } = basis(pose.azimuth + drift, pose.elevation);

  // Sliding the subject right on screen means trucking the camera left.
  const frameHeight = 2 * pose.distance * Math.tan(toRadians(fov / 2));
  const truckRight = -pose.shift[0] * frameHeight * aspect;
  const truckUp = -pose.shift[1] * frameHeight;
  const lookAt: Vec3 = [
    pose.center[0] + right[0] * truckRight + up[0] * truckUp,
    pose.center[1] + right[1] * truckRight + up[1] * truckUp,
    pose.center[2] + right[2] * truckRight + up[2] * truckUp,
  ];
  const position: Vec3 = [
    lookAt[0] + out[0] * pose.distance,
    lookAt[1] + out[1] * pose.distance,
    lookAt[2] + out[2] * pose.distance,
  ];

  return { position, lookAt };
};
