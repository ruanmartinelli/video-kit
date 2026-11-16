import { lerp3, type Vec3 } from "./motion";
import { theme } from "./theme";

type PacketProps = {
  from: Vec3;
  to: Vec3;
  /** 0 = at `from`, 1 = at `to`. Hidden outside (0, 1). */
  progress: number;
};

const ARC_HEIGHT = 0.5;

export const Packet = ({ from, to, progress }: PacketProps) => {
  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const [x, y, z] = lerp3(from, to, progress);

  return (
    <mesh position={[x, y + Math.sin(Math.PI * progress) * ARC_HEIGHT, z]}>
      <sphereGeometry args={[0.24, 32, 32]} />
      <meshStandardMaterial color={theme.accent} emissive={theme.accent} emissiveIntensity={2} />
    </mesh>
  );
};
