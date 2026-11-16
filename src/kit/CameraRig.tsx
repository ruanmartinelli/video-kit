import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { useCurrentFrame } from "remotion";
import { ease, lerp3, type Vec3 } from "./motion";

export type Shot = {
  /** Frame at which the camera starts moving to this shot. */
  at: number;
  position: Vec3;
  lookAt: Vec3;
};

type CameraRigProps = {
  /** Ordered by `at`. The first shot is where the camera starts. */
  shots: [Shot, ...Shot[]];
  /** Frames each move takes. */
  moveFrames?: number;
};

export const CameraRig = ({ shots, moveFrames = 40 }: CameraRigProps) => {
  const frame = useCurrentFrame();
  const camera = useThree((state) => state.camera);

  let position = shots[0].position;
  let lookAt = shots[0].lookAt;
  for (const shot of shots.slice(1)) {
    const t = ease(frame, shot.at, shot.at + moveFrames);
    position = lerp3(position, shot.position, t);
    lookAt = lerp3(lookAt, shot.lookAt, t);
  }

  const [px, py, pz] = position;
  const [lx, ly, lz] = lookAt;
  useLayoutEffect(() => {
    camera.position.set(px, py, pz);
    camera.lookAt(lx, ly, lz);
  }, [camera, px, py, pz, lx, ly, lz]);

  return null;
};
