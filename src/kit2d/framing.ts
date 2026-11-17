import { shotSchema, type Shot } from "../kit/camera";
import type { Vec3 } from "../kit/motion";
import { settled } from "./camera";

type Framed = { id: string; label: string; position: Vec3 };

/** A node's plate and its label, in world units. Node draws with the same numbers. */
export const PLATE = { width: 2.3, height: 1.7, radius: 0.22 };
export const LABEL = { lift: 0.32, size: 0.4 };
/** Average width of a character, as a share of the text size. On the wide side, so a near miss is caught. */
const CHARACTER = 0.6;

type Box = { left: number; right: number; top: number; bottom: number };
const apart = (a: Box, b: Box) => a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top;

/** Where a node's label is on the frame. */
export const labelBox = (label: string, [x, y]: [number, number], scale: number): Box => {
  const half = (label.length * LABEL.size * CHARACTER * scale) / 2;
  const bottom = y - (PLATE.height / 2 + LABEL.lift) * scale;
  return { left: x - half, right: x + half, top: bottom - LABEL.size * scale, bottom };
};

/**
 * Checks every shot once the camera has settled on it. A flat frame is exact,
 * so this knows where every label and plate is: a label on top of another
 * label or of another node throws, with what to change.
 */
export const assertFraming = (shots: Shot[], nodes: Framed[], width: number, height: number) => {
  for (const input of shots) {
    const shot = shotSchema.parse(input);
    const camera = settled(input, width, height);
    const seen = nodes
      .filter((node) => !shot.allow.includes(node.id))
      .map((node) => {
        const at = camera.point(node.position);
        const plate: Box = {
          left: at[0] - (PLATE.width / 2) * camera.scale,
          right: at[0] + (PLATE.width / 2) * camera.scale,
          top: at[1] - (PLATE.height / 2) * camera.scale,
          bottom: at[1] + (PLATE.height / 2) * camera.scale,
        };
        return { node, plate, label: labelBox(node.label, at, camera.scale) };
      })
      // A label the frame edge cuts is hidden, so it cannot collide.
      .filter(({ label }) => label.left >= 0 && label.right <= width && label.top >= 0 && label.bottom <= height);

    for (const [index, a] of seen.entries()) {
      for (const b of seen.slice(index + 1)) {
        if (!apart(a.label, b.label)) {
          throw new Error(
            `In the shot at frame ${shot.at} the labels "${a.node.label}" and "${b.node.label}" overlap. Widen the graph's columnGap or rowGap, or shorten a label.`,
          );
        }
        for (const [label, plate] of [
          [a, b],
          [b, a],
        ] as const) {
          if (!apart(label.label, plate.plate)) {
            throw new Error(
              `In the shot at frame ${shot.at} the label "${label.node.label}" sits on "${plate.node.label}". Widen the graph's rowGap or columnGap.`,
            );
          }
        }
      }
    }
  }
};
