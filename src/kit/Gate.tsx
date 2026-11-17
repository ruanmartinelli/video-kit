import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, Quaternion, Vector3, type Group } from "three";
import { z } from "zod";
import { useDim } from "./Focus";
import { span } from "./geometry";
import { Type } from "./Label";
import { lerp3, unitSchema, vec3Schema, type Vec3 } from "./motion";
import { theme } from "./theme";
import { gateSchema } from "./schemas";

export { gateSchema };

type GateProps = z.input<typeof gateSchema>;

const RING_RADIUS = 0.5;
const TUBE_RADIUS = 0.09;
/** From the ring's center to the bottom of its rule: above a passing packet's label at the top of its arc. */
const RULE_LIFT = 1.5;
const Z_AXIS = new Vector3(0, 0, 1);
const UP = new Vector3(0, 1, 0);
/** How far the ring turns off the pipe's line to show the camera its face. Past this the pipe would leave the hole. */
const MAX_TURN = 0.7;

/** The ring's center: where a Packet stops to be checked. Send one with `clear` [NODE_CLEAR, 0] to it, then on with [0, NODE_CLEAR] or back. */
export const gatePoint = (from: Vec3, to: Vec3, at = 0.5): Vec3 => {
  const [start, end] = span(from, to);
  return lerp3(start, end, at);
};

/** A condition on a connection: a ring the pipe runs through, with its rule above it. Packets that match go through; the rest bounce back. */
export const Gate = (props: GateProps) => {
  const { id, from, to, at, rule, active, tone, appear } = gateSchema.parse(props);
  const dim = useDim(id);
  const ring = useRef<Group>(null);

  // A ring square to the pipe is a thin sliver from the side. Like a Billboard it reads the camera, not a clock:
  // it faces along the pipe, then turns toward the viewer as far as the pipe still fits through it.
  useFrame(({ camera }) => {
    if (!ring.current) {
      return;
    }
    const [x, , z] = gatePoint(from, to, at);
    const along = new Vector3(to[0] - from[0], 0, to[2] - from[2]).normalize();
    const toCamera = new Vector3(camera.position.x - x, 0, camera.position.z - z).normalize();
    if (along.dot(toCamera) < 0) {
      along.negate();
    }
    const off = Math.atan2(along.clone().cross(toCamera).y, along.dot(toCamera));
    along.applyAxisAngle(UP, Math.sign(off) * Math.min(Math.abs(off), MAX_TURN));
    ring.current.quaternion.copy(new Quaternion().setFromUnitVectors(Z_AXIS, along));
  });

  if (appear <= 0) {
    return null;
  }

  const center = gatePoint(from, to, at);
  const lit = active * (1 - dim);
  const dimmed = (color: string) => new Color(color).lerp(new Color(theme.dimmed), dim);
  const color = dimmed(theme.edge).lerp(new Color(theme[tone]), lit);
  const text = dimmed(theme.textDim).lerp(new Color(theme[tone]), lit);

  return (
    <group position={center} scale={appear}>
      <group ref={ring} scale={1 + 0.12 * lit}>
        <mesh>
          <torusGeometry args={[RING_RADIUS, TUBE_RADIUS, 24, 64]} />
          <meshStandardMaterial color={color} emissive={theme[tone]} emissiveIntensity={1.5 * theme.glow * lit} roughness={0.4} />
        </mesh>
      </group>
      {rule ? (
        <Billboard position={[0, RULE_LIFT, 0]}>
          <Type size={0.34} font="mono" color={`#${text.getHexString()}`} opacity={1 - 0.75 * dim} onTop>
            {rule}
          </Type>
        </Billboard>
      ) : null}
    </group>
  );
};
