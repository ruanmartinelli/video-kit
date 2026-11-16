import { lerp3, type Vec3 } from "./motion";

export const NODE_WIDTH = 2;
export const NODE_HEIGHT = 1.2;
/** How far from a node's center a pipe or packet has to start to be outside it. */
export const NODE_CLEAR = NODE_WIDTH / 2 + 0.1;

/**
 * The visible stretch between two centers: starts and ends `clear` away from
 * each one, so pipes and packets are never hidden inside what they connect.
 */
export const span = (from: Vec3, to: Vec3, clear: [number, number] = [NODE_CLEAR, NODE_CLEAR]): [Vec3, Vec3] => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const inset = (distance: number) => Math.min(0.45, distance / length);
  return [lerp3(from, to, inset(clear[0])), lerp3(from, to, 1 - inset(clear[1]))];
};
