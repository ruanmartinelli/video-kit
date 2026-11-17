/** A node's plate and its label, in world units. Node draws with these, and the camera and the checks measure with them. */
export const PLATE = { width: 2.3, height: 1.7, radius: 0.22 };
export const LABEL = { lift: 0.32, size: 0.4 };
/** Average width of a character, as a share of the text size. On the wide side, so a near miss is caught. */
export const CHARACTER = 0.6;

/** Half the width of a node's label, in world units. */
export const labelHalf = (label: string) => (label.length * LABEL.size * CHARACTER) / 2;

/** A position as a key, to find the node a camera target is. */
export const keyOf = (position: readonly number[]) => `${position[0]},${position[2]}`;
