import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { assertFraming, resolveCamera, shotSchema } from "./camera";
import type { Graph } from "./graph";
import { CAMERA_FOV } from "./World";

export const cameraRigSchema = z.object({
  shots: z.array(shotSchema).min(1).describe("Ordered by `at`. The first shot is where the camera starts."),
  moveFrames: z.number().default(45).describe("Frames each move between shots takes."),
  sway: z.number().default(3).describe("Degrees of slow side-to-side drift. 0 locks the camera off."),
});

type CameraRigProps = z.input<typeof cameraRigSchema> & {
  /** The graph on stage, or several. With it the rig checks every shot once the camera has settled: two node labels overlapping throws, and says what to change. */
  graph?: Graph | Graph[];
};

/** Directs the camera: give it what to frame and from which angle, it works out where to stand. */
export const CameraRig = ({ graph, ...props }: CameraRigProps) => {
  const { shots, moveFrames, sway } = cameraRigSchema.parse(props);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const camera = useThree((state) => state.camera);

  if (graph) {
    assertFraming(
      props.shots,
      [graph].flat().flatMap((one) => one.nodes),
      CAMERA_FOV,
      width / height,
    );
  }

  const { position, lookAt } = resolveCamera({
    shots,
    frame,
    fps,
    fov: CAMERA_FOV,
    aspect: width / height,
    moveFrames,
    sway,
  });

  const [px, py, pz] = position;
  const [lx, ly, lz] = lookAt;
  useLayoutEffect(() => {
    camera.position.set(px, py, pz);
    camera.lookAt(lx, ly, lz);
  }, [camera, px, py, pz, lx, ly, lz]);

  return null;
};
