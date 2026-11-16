import { Easing, interpolate } from "remotion";

export type Vec3 = [number, number, number];

/** 0 before `from`, 1 after `to`, eased in between. */
export const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

/** Rises to 1 at `at`, then decays back to 0 over `decay` frames. */
export const pulse = (frame: number, at: number, decay = 20) =>
  interpolate(frame, [at - 4, at, at + decay], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
