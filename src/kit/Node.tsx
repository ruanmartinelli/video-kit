import type { ReactNode } from "react";
import { Color } from "three";
import { z } from "zod";
import { useDim } from "./Focus";
import { NODE_HEIGHT } from "./geometry";
import { Label } from "./Label";
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
  shape: nodeShapeSchema.default("service").describe("What it looks like. Pick the one that names what the node is; service is a plain box."),
});

export type NodeState = z.input<typeof nodeStateSchema> & {
  /** Internals, in the node's local space. Only visible as `open` goes to 1. Every shape fits a 2 x 1.2 x 2 box. */
  children?: ReactNode;
};

type NodeProps = z.input<typeof nodeSchema> & Pick<NodeState, "children">;

const GLASS_OPACITY = 0.16;

/** A service, process or machine. Can light up, enter the scene, and open to show what's inside. */
export const Node = ({ children, ...props }: NodeProps) => {
  const { id, position, label, shape, active, tone, appear, open } = nodeSchema.parse(props);
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

  return (
    <group position={position} scale={appear}>
      <group scale={1 + 0.06 * active}>
        <Shape
          body={<meshStandardMaterial {...glass} color={dimmed(theme.surface)} emissive={theme[tone]} emissiveIntensity={0.45 * active * lit} />}
          trim={<meshStandardMaterial {...glass} color={dimmed(theme.pipe)} emissive={theme[tone]} emissiveIntensity={0.45 * active * lit} />}
          inset={<meshStandardMaterial {...glass} color={theme.dimmed} emissive={theme[tone]} emissiveIntensity={0.2 * active * lit} />}
          glow={<meshStandardMaterial {...glass} color={dimmed(theme[tone])} emissive={theme[tone]} emissiveIntensity={0.9 * lit} />}
        />
      </group>
      {open > 0 ? <group scale={open}>{children}</group> : null}
      <Label position={[0, NODE_HEIGHT / 2 + 0.42, 0]} opacity={1 - 0.75 * dim}>
        {label}
      </Label>
    </group>
  );
};
