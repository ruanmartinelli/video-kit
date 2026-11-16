import type { ComponentType } from "react";
import { useCurrentFrame } from "remotion";
import { CameraRig, ease, Node, NODE_HEIGHT, Packet, Pipe, pulse, World, type Vec3 } from "../src/kit";
import { Tracer, tracerMeta } from "../src/videos/tracer/Tracer";

export type Demo = {
  kind: "video" | "component";
  name: string;
  description: string;
  component: ComponentType;
  durationInFrames: number;
  code?: string;
};

const Y = NODE_HEIGHT / 2;
const left: Vec3 = [-3, Y, 0];
const right: Vec3 = [3, Y, 0];

const NodeDemo = () => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, position: [3.5, 3.2, 6.5], lookAt: [0, Y, 0] }]} />
      <Node position={[0, Y, 0]} label="Service" active={pulse(frame, 30, 40)} />
    </World>
  );
};

const PacketDemo = () => {
  const frame = useCurrentFrame();
  return (
    <World>
      <CameraRig shots={[{ at: 0, position: [0, 4.5, 10], lookAt: [0, Y, 0] }]} />
      <Pipe from={left} to={right} />
      <Node position={left} label="From" />
      <Node position={right} label="To" active={pulse(frame, 62)} />
      <Packet from={left} to={right} progress={ease(frame, 15, 62)} />
    </World>
  );
};

const CameraDemo = () => (
  <World>
    <CameraRig
      shots={[
        { at: 0, position: [0, 7, 13], lookAt: [0, Y, 0] },
        { at: 20, position: [-5, 2.2, 5], lookAt: [-3, Y, 0] },
        { at: 70, position: [6, 3, 5], lookAt: [3, Y, 0] },
      ]}
    />
    <Pipe from={left} to={right} />
    <Node position={left} label="A" />
    <Node position={right} label="B" />
  </World>
);

export const demos: Demo[] = [
  {
    kind: "video",
    name: "Tracer",
    description:
      "The end-to-end test video. Narration comes from edge-tts; the packet, highlights, camera moves and captions are all keyed to its word timestamps.",
    component: Tracer,
    durationInFrames: tracerMeta.durationInFrames,
  },
  {
    kind: "component",
    name: "Node",
    description: "A service, process or machine. `active` goes from 0 to 1 to light it up.",
    component: NodeDemo,
    durationInFrames: 90,
    code: `<Node position={[0, NODE_HEIGHT / 2, 0]} label="Service" active={pulse(frame, 30, 40)} />`,
  },
  {
    kind: "component",
    name: "Packet + Pipe",
    description: "The thing the viewer follows, and the connection it travels along.",
    component: PacketDemo,
    durationInFrames: 90,
    code: `<Pipe from={a} to={b} />
<Packet from={a} to={b} progress={ease(frame, 15, 62)} />`,
  },
  {
    kind: "component",
    name: "CameraRig",
    description: "A list of shots. The camera eases from one to the next at each shot's `at` frame.",
    component: CameraDemo,
    durationInFrames: 130,
    code: `<CameraRig
  shots={[
    { at: 0, position: [0, 7, 13], lookAt: [0, Y, 0] },
    { at: 20, position: [-5, 2.2, 5], lookAt: [-3, Y, 0] },
    { at: 70, position: [6, 3, 5], lookAt: [3, Y, 0] },
  ]}
/>`,
  },
];
