import { Billboard, Outlines } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import { Color, Vector3, type Group } from "three";
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
  badge: z
    .enum(["locked", "syncing", "failed", "done"])
    .optional()
    .describe("A small mark at its top right corner for a state it is in: locked, syncing, failed, done. Set it from the frame the state starts."),
});

export const nodeSchema = nodeStateSchema.extend({
  id: z.string().optional().describe("Name used by Focus to keep this node lit."),
  position: vec3Schema.describe("Center of the box. y = NODE_HEIGHT / 2 sits it on the floor."),
  label: z.string(),
  change: z
    .enum(["added", "changed", "removed"])
    .optional()
    .describe(
      "What the change being shown did to this node: a pull request, a migration, a new version. Colors its outline; leave it out for nodes the change did not touch.",
    ),
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
const LABEL_SIZE = 0.36;
/** Average width of a character, as a share of the text size. On the wide side, so a label hides a little early. */
const LABEL_CHARACTER = 0.6;

const BADGE_RADIUS = 0.27;
const BADGE_AT: [number, number, number] = [0.98, 0.66, 0];
const STROKE = 0.05;

/** A flat mark that faces the camera and draws over the shape behind it. */
const Badge = ({ kind, opacity }: { kind: NonNullable<z.infer<typeof nodeStateSchema>["badge"]>; opacity: number }) => {
  const ink = kind === "failed" ? theme.danger : kind === "done" ? theme.added : theme.text;
  const flat = (color: string) => <meshBasicMaterial color={color} toneMapped={false} transparent opacity={opacity} depthTest={false} />;
  const bar = (key: string, x: number, y: number, length: number, angle: number) => (
    <mesh key={key} position={[x, y, 0]} rotation={[0, 0, angle]} renderOrder={22}>
      <planeGeometry args={[length, STROKE]} />
      {flat(ink)}
    </mesh>
  );
  return (
    <Billboard position={BADGE_AT}>
      <mesh renderOrder={20}>
        <circleGeometry args={[BADGE_RADIUS, 40]} />
        {flat(kind === "failed" ? theme.danger : theme.edge)}
      </mesh>
      <mesh renderOrder={21}>
        <circleGeometry args={[BADGE_RADIUS - 0.035, 40]} />
        {flat(theme.background)}
      </mesh>
      {kind === "locked" ? (
        <>
          <mesh position={[0, -0.05, 0]} renderOrder={22}>
            <planeGeometry args={[0.2, 0.15]} />
            {flat(ink)}
          </mesh>
          <mesh position={[0, 0.025, 0]} renderOrder={22}>
            <ringGeometry args={[0.045, 0.08, 24, 1, 0, Math.PI]} />
            {flat(ink)}
          </mesh>
        </>
      ) : null}
      {kind === "syncing" ? (
        <>
          {[0, Math.PI].map((turn) => (
            <group key={turn} rotation={[0, 0, turn]}>
              <mesh renderOrder={22}>
                <ringGeometry args={[0.09, 0.09 + STROKE, 24, 1, 0.5, Math.PI - 1]} />
                {flat(ink)}
              </mesh>
              <mesh position={[0.115 * Math.cos(0.4), 0.115 * Math.sin(0.4), 0]} rotation={[0, 0, 0.4 - Math.PI / 2 + Math.PI]} renderOrder={22}>
                <circleGeometry args={[0.07, 3]} />
                {flat(ink)}
              </mesh>
            </group>
          ))}
        </>
      ) : null}
      {kind === "failed" ? [bar("a", 0, 0, 0.26, Math.PI / 4), bar("b", 0, 0, 0.26, -Math.PI / 4)] : null}
      {kind === "done" ? [bar("a", -0.07, -0.035, 0.12, -Math.PI / 4), bar("b", 0.035, 0.005, 0.24, Math.PI / 4)] : null}
    </Billboard>
  );
};

/** A service, process or machine. Can light up, enter the scene, and open to show what's inside. */
export const Node = ({ children, ...props }: NodeProps) => {
  const { id, position, label, shape, change, active, tone, appear, open, badge } = nodeSchema.parse(props);
  const dim = useDim(id);
  const text = useRef<Group>(null);

  // A label the frame edge cuts reads as a mistake, while a node half out of frame with no label reads as background.
  // So the label shows only while all of it is on screen. Like a Billboard, this reads the camera, not a clock.
  useFrame(({ camera }) => {
    if (!text.current) {
      return;
    }
    camera.updateMatrixWorld();
    const across = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const upward = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const half = (label.length * LABEL_SIZE * LABEL_CHARACTER * appear) / 2;
    const corner = (side: number, lift: number) =>
      new Vector3(...position)
        .addScaledVector(upward, lift * appear)
        .addScaledVector(across, side * half)
        .project(camera);
    const [low, high] = [corner(-1, LABEL_LIFT), corner(1, LABEL_LIFT + LABEL_SIZE)];
    text.current.visible = low.x >= -1 && high.x <= 1 && low.y >= -1 && high.y <= 1;
  });

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
      {badge ? <Badge kind={badge} opacity={1 - 0.75 * dim} /> : null}
      {/* Lifted toward the top of the screen, not the top of the world: from above, a label over the box's roof would sit on the roof. */}
      <Billboard>
        <group ref={text}>
          <Type position={[0, LABEL_LIFT, 0]} size={LABEL_SIZE} opacity={1 - 0.75 * dim}>
            {label}
          </Type>
        </group>
      </Billboard>
    </group>
  );
};
