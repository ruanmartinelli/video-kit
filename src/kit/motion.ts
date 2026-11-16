import { Easing, interpolate, spring } from "remotion";
import { z } from "zod";

export const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof vec3Schema>;

export const unitSchema = z.number().min(0).max(1);

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

/** 0 before `at`, then springs to 1 with a little overshoot. For things entering the scene. */
export const pop = (frame: number, at: number, fps = 30) => spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 140 } });

/** 1 between two cues, 0 outside them, eased in and out. For anything that is on screen for a stretch: a panel, a chip, a callout. */
export const between = (frame: number, from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));

/** A packet's progress for a trip that starts at `start`. About half a second, so one hop fits inside a spoken word. */
export const hop = (frame: number, start: number, frames = 14) => ease(frame, start, start + frames);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
