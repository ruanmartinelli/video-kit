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
  panel: z
    .enum(["left", "right"])
    .optional()
    .describe("The side a docked panel (CodePanel, Outcomes, Tables, Meter, ...) is on during this shot. The rig fits the targets into the rest of the frame."),
  shift: z
    .tuple([z.number(), z.number()])
    .optional()
    .describe("Slide the subject on screen, as a fraction of the frame: [right, up]. Defaults to a little above center, or clear of `panel` when that is set."),
  allow: z
    .array(z.string())
    .default([])
    .describe("Ids of nodes left out of the label check: ones that are not in the scene during this shot. Only read when the rig is given a `graph`."),
});

export type Shot = z.input<typeof shotSchema>;

type Pose = { center: Vec3; azimuth: number; elevation: number; distance: number; shift: [number, number] };

/** Share of the frame's width a docked panel takes, with its margin: 760 + 96 of 1920. */
const PANEL_SHARE = 0.45;

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
  // A docked panel leaves a narrower frame to fit into.
  const tanHorizontal = tanVertical * aspect * (shot.panel ? 1 - PANEL_SHARE : 1);
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
    // Beside a panel the subject also sits low: most panels hang from the top of the frame, and what is beside them reads better under their top edge.
    shift: shot.shift ?? (shot.panel ? [shot.panel === "right" ? -PANEL_SHARE / 2 : PANEL_SHARE / 2, -0.1] : [0, 0.07]),
  };
};

/** Where a pose puts the camera. `drift` is extra degrees of azimuth. */
const place = (pose: Pose, drift: number, fov: number, aspect: number) => {
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
  const position: Vec3 = [lookAt[0] + out[0] * pose.distance, lookAt[1] + out[1] * pose.distance, lookAt[2] + out[2] * pose.distance];

  return { position, lookAt, out, right, up };
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
  const { position, lookAt } = place(pose, drift, fov, aspect);

  return { position, lookAt };
};

type Framed = { id: string; label: string; position: Vec3 };

/** A node's label, as Node draws it: lifted toward the top of the screen, 0.36 tall. */
const LABEL_LIFT = 1.2;
const LABEL_SIZE = 0.36;
/** Average width of a character, as a share of the text size. On the wide side, so a near miss is caught. */
const CHARACTER = 0.6;

/**
 * Checks every shot once the camera has settled on it: two node labels on top
 * of each other is always a mistake, and cheaper to hear about here than to
 * find on a still. Throws with what to change.
 */
export const assertFraming = (shots: Shot[], nodes: Framed[], fov: number, aspect: number) => {
  const tanVertical = Math.tan(toRadians(fov / 2));
  const tanHorizontal = tanVertical * aspect;

  for (const input of shots) {
    const shot = shotSchema.parse(input);
    const { position, out, right, up } = place(poseOf(input, fov, aspect), 0, fov, aspect);
    const project = (point: Vec3): [number, number] | null => {
      const offset: Vec3 = [point[0] - position[0], point[1] - position[1], point[2] - position[2]];
      const depth = -dot(offset, out);
      return depth <= 0.1 ? null : [dot(offset, right) / (depth * tanHorizontal), dot(offset, up) / (depth * tanVertical)];
    };
    const along = (from: Vec3, direction: Vec3, distance: number, lift: number): Vec3 => [
      from[0] + direction[0] * distance + up[0] * lift,
      from[1] + direction[1] * distance + up[1] * lift,
      from[2] + direction[2] * distance + up[2] * lift,
    ];
    const box = (points: Vec3[]) => {
      const flat = points.map(project);
      if (flat.some((point) => point === null)) {
        return null;
      }
      const xs = flat.map((point) => (point as [number, number])[0]);
      const ys = flat.map((point) => (point as [number, number])[1]);
      return { left: Math.min(...xs), right: Math.max(...xs), bottom: Math.min(...ys), top: Math.max(...ys) };
    };

    // A label the frame edge would cut is hidden by its Node, so only labels that are whole on screen can collide.
    const labels: { node: Framed; box: NonNullable<ReturnType<typeof box>> }[] = [];
    for (const node of nodes) {
      const half = (node.label.length * LABEL_SIZE * CHARACTER) / 2;
      const label = box([along(node.position, right, -half, LABEL_LIFT), along(node.position, right, half, LABEL_LIFT + LABEL_SIZE)]);
      if (label && label.left >= -1 && label.right <= 1 && label.bottom >= -1 && label.top <= 1 && !shot.allow.includes(node.id)) {
        labels.push({ node, box: label });
      }
    }

    for (const [index, a] of labels.entries()) {
      for (const b of labels.slice(index + 1)) {
        const apart = a.box.right < b.box.left || b.box.right < a.box.left || a.box.top < b.box.bottom || b.box.top < a.box.bottom;
        if (!apart) {
          throw new Error(
            `In the shot at frame ${shot.at} the labels "${a.node.label}" and "${b.node.label}" overlap. Change the shot's azimuth or elevation, widen the graph's rowGap or columnGap, or shorten a label.`,
          );
        }
      }
    }
  }
};
