import { Audio, staticFile, useCurrentFrame } from "remotion";
import {
  CameraRig,
  Caption,
  cueFrame,
  ease,
  narrationFrames,
  Node,
  NODE_HEIGHT,
  Packet,
  Pipe,
  pulse,
  World,
  type Vec3,
} from "../../kit";
import narration from "./narration.json";

const FPS = 30;
const TAIL_FRAMES = 30;
const Y = NODE_HEIGHT / 2;

const client: Vec3 = [-5.5, Y, 0];
const balancer: Vec3 = [0, Y, 0];
const serverA: Vec3 = [5.5, Y, -2.6];
const serverB: Vec3 = [5.5, Y, 2.6];

const cue = (word: string) => cueFrame(narration, word, FPS);
const leaves = cue("leaves");
const hits = cue("hits");
const routed = cue("routed");
const arrives = cue("server") + 8;

export const tracerMeta = {
  id: "Tracer",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: narrationFrames(narration, FPS) + TAIL_FRAMES,
};

export const Tracer = () => {
  const frame = useCurrentFrame();

  return (
    <World
      overlay={
        <>
          <Audio src={staticFile("narration/tracer.mp3")} />
          <Caption narration={narration} />
        </>
      }
    >
      <CameraRig
        shots={[
          { at: 0, position: [-3, 6.5, 14], lookAt: [-1, Y, 0] },
          { at: hits - 15, position: [1, 4, 9.5], lookAt: [1.5, Y, 0] },
          { at: routed, position: [14.5, 4.2, -8.5], lookAt: [2.5, 1, -0.5] },
        ]}
      />

      <Pipe from={client} to={balancer} />
      <Pipe from={balancer} to={serverA} />
      <Pipe from={balancer} to={serverB} />

      <Node position={client} label="Client" active={pulse(frame, leaves)} />
      <Node position={balancer} label="Load balancer" active={pulse(frame, hits + 6, 30)} />
      <Node position={serverA} label="Server A" active={ease(frame, arrives - 4, arrives + 8)} />
      <Node position={serverB} label="Server B" />

      <Packet from={client} to={balancer} progress={ease(frame, leaves, hits + 6)} />
      <Packet from={balancer} to={serverA} progress={ease(frame, routed, arrives)} />
    </World>
  );
};
