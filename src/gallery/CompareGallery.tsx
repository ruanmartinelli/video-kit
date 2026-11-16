import { useCurrentFrame } from "remotion";
import { CameraRig, CodePanel, ease, Graph3D, Label, layoutGraph, layoutLanes, Packet, pulse, World } from "../kit";

export const compareGalleryMeta = { id: "CompareGallery", fps: 30, width: 1920, height: 1080, durationInFrames: 240 };

const graph = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "phone" },
    { id: "api", label: "API", shape: "server" },
    { id: "jobs", label: "Jobs", shape: "worker" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["client", "api"],
    ["api", "jobs"],
    ["jobs", "db"],
  ],
  columnGap: 5,
});
const { before, after } = layoutLanes(graph);
const everything = [...before.nodes.map((node) => node.position), ...after.nodes.map((node) => node.position), before.labelAt, after.labelAt];
const LEG = 16;

const CODE = `
for (const job of batch) {
  retry(job);
  retry(job, { max: 3 });
}
`;

/** Lanes, node badges and a code diff. `pnpm stills CompareGallery`. */
export const CompareGallery = () => {
  const frame = useCurrentFrame();
  const codeIn = ease(frame, 170, 184);
  const hop = (lane: typeof before, name: string, from: string, to: string, start: number, danger = false) => (
    <Packet
      key={name + from + start}
      from={lane.position(`${name}/${from}`)}
      to={lane.position(`${name}/${to}`)}
      progress={ease(frame, start, start + LEG)}
      tone={danger ? "danger" : "accent"}
    />
  );
  const stuck = frame >= 40 + 2 * LEG;

  return (
    <World overlay={<CodePanel code={CODE} title="worker.ts" removed={[2]} added={[3]} appear={codeIn} />}>
      <CameraRig
        shots={[
          { at: 0, targets: everything, azimuth: 10, padding: 1.1 },
          { at: 160, targets: everything, azimuth: 10, padding: 1.5, shift: [-0.2, 0] },
        ]}
      />
      <Label position={before.labelAt} size={0.5}>
        before
      </Label>
      <Label position={after.labelAt} size={0.5}>
        after
      </Label>
      <Graph3D
        graph={before}
        nodes={{
          "before/jobs": { active: stuck ? 1 : 0, tone: "danger", badge: stuck ? "failed" : frame >= 40 + LEG ? "syncing" : undefined },
          "before/db": { badge: "locked" },
        }}
      />
      <Graph3D
        graph={after}
        nodes={{ "after/jobs": { active: pulse(frame, 40 + 2 * LEG, 20) }, "after/db": { badge: frame >= 40 + 3 * LEG ? "done" : "locked" } }}
      />
      {hop(before, "before", "client", "api", 40)}
      {hop(before, "before", "api", "jobs", 40 + LEG, true)}
      {hop(after, "after", "client", "api", 40)}
      {hop(after, "after", "api", "jobs", 40 + LEG)}
      {hop(after, "after", "jobs", "db", 40 + 2 * LEG)}
    </World>
  );
};
