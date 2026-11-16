import { RoundedBox } from "@react-three/drei";
import { Label } from "./Label";
import type { Vec3 } from "./motion";
import { theme } from "./theme";

export const NODE_HEIGHT = 1.2;

type NodeProps = {
  /** Center of the box. Use y = NODE_HEIGHT / 2 to sit it on the floor. */
  position: Vec3;
  label: string;
  /** 0 = idle, 1 = fully lit. Drive it from the frame. */
  active?: number;
};

export const Node = ({ position, label, active = 0 }: NodeProps) => {
  const scale = 1 + 0.06 * active;

  return (
    <group position={position}>
      <RoundedBox args={[2, NODE_HEIGHT, 2]} radius={0.16} smoothness={4} scale={scale}>
        <meshStandardMaterial
          color={theme.surface}
          emissive={theme.accent}
          emissiveIntensity={0.45 * active}
          roughness={0.5}
        />
      </RoundedBox>
      <Label position={[0, NODE_HEIGHT / 2 + 0.3, 0]}>{label}</Label>
    </group>
  );
};
