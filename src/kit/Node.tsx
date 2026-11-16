import { Billboard, Outlines } from "@react-three/drei";
import type { ReactNode } from "react";
import { Color } from "three";
import { z } from "zod";
import { useDim } from "./Focus";
import { Type } from "./Label";
import { unitSchema, vec3Schema } from "./motion";
import { nodeShapeSchema, shapes } from "./shapes";
import { theme } from "./theme";

export const nodeStateSchema = z.object({
  active: unitSchema.default(0).describe("0 = idle, 1 = fully lit in the tone color."),
  tone: z.enum(["accent", "danger"]).default("accent").describe("Color it lights up in. Use danger for overload or failure."),
  appear: z.number().min(0).default(1).describe("0 = not in the scene, 1 = fully there. Drive with pop(), which overshoots a little."),
  open: unitSchema.default(0).describe("0 = solid, 1 = glass shell with its children visible inside."),
});

export const nodeSchema = nodeStateSchema.extend({
  id: z.string().optional().describe("Name used by Focus to keep this node lit."),
  position: vec3Schema.describe("Center of the box. y = NODE_HEIGHT / 2 sits it on the floor."),
  label: z.string(),
  change: z.enum(["added", "changed", "removed"]).optional().describe("What a PR did to this node. Colors its outline; leave it out for nodes the PR did not touch."),
  shape: nodeShapeSchema.default("service").describe("What it looks like. Pick the one that names what the node is; service is a plain box."),
});

export type NodeState = z.input<typeof nodeStateSchema> & {
  /** Internals, in the node's local space. Only visible as `open` goes to 1. Every shape fits a 2 x 1.2 x 2 box. */
  children?: ReactNode;
};

type NodeProps = z.input<typeof nodeSchema> & Pick<NodeState, "children">;

const GLASS_OPACITY = 0.16;
const LIT_TINT = 0.3;
/** In pixels of the rendered frame. */
const OUTLINE_THICKNESS = 3;
const CHANGE_OUTLINE_THICKNESS = 7;
/** From the node's center to the bottom of its label: clears the box's outline from any camera angle. */
const LABEL_LIFT = 1.2;

/** A service, process or machine. Can light up, enter the scene, and open to show what's inside. */
export const Node = ({ children, ...props }: NodeProps) => {
  const { id, position, label, shape, change, active, tone, appear, open } = nodeSchema.parse(props);
  const dim = useDim(id);

  if (appear <= 0) {
    return null;
  }

  const Shape = shapes[shape];
  const lit = 1 - dim;
  const glass = {
    roughness: 0.5,
    transparent: open > 0,
    opacity: 1 - (1 - GLASS_OPACITY) * open,
    depthWrite: open === 0,
  };
  const dimmed = (color: string) => new Color(color).lerp(new Color(theme.dimmed), dim);
  // Lit parts take on the tone itself, so the state reads on a light background where a glow would not.
  const tinted = (color: string) => dimmed(color).lerp(new Color(theme[tone]), LIT_TINT * active * lit);

  // Idle shapes are grey on black: the outline is what separates them. Lit, it takes the tone.
  const outline = (
    <Outlines
      thickness={change ? CHANGE_OUTLINE_THICKNESS : OUTLINE_THICKNESS}
      color={dimmed(change ? theme[change] : theme.edge).lerp(new Color(theme[tone]), active * lit)}
      transparent={open > 0}
      opacity={1 - 0.88 * open}
    />
  );

  return (
    <group position={position} scale={appear}>
      <group scale={1 + 0.06 * active}>
        <Shape
          body={
            <>
              <meshStandardMaterial {...glass} color={tinted(theme.surface)} emissive={theme[tone]} emissiveIntensity={0.14 * theme.glow * active * lit} />
              {outline}
            </>
          }
          trim={
            <>
              <meshStandardMaterial {...glass} color={tinted(theme.pipe)} emissive={theme[tone]} emissiveIntensity={0.14 * theme.glow * active * lit} />
              {outline}
            </>
          }
          inset={<meshStandardMaterial {...glass} color={dimmed(theme.inset)} />}
          glow={<meshStandardMaterial {...glass} color={dimmed(theme[tone])} emissive={theme[tone]} emissiveIntensity={0.9 * theme.glow * lit} />}
        />
      </group>
      {open > 0 ? <group scale={open}>{children}</group> : null}
      {/* Lifted toward the top of the screen, not the top of the world: from above, a label over the box's roof would sit on the roof. */}
      <Billboard>
        <Type position={[0, LABEL_LIFT, 0]} size={0.36} opacity={1 - 0.75 * dim}>
          {label}
        </Type>
      </Billboard>
    </group>
  );
};
