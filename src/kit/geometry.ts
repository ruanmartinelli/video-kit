import { lerp3, type Vec3 } from "./motion";

export const NODE_WIDTH = 2;
export const NODE_HEIGHT = 1.2;

/**
 * The visible stretch between two node centers: starts and ends just outside
 * each node's box, so pipes and packets are never hidden inside one.
 */
export const span = (from: Vec3, to: Vec3): [Vec3, Vec3] => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const inset = Math.min(0.45, (NODE_WIDTH / 2 + 0.1) / length);
  return [lerp3(from, to, inset), lerp3(from, to, 1 - inset)];
};
