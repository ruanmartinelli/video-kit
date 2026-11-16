import { useCurrentFrame } from "remotion";
import { CameraRig, Caption, Chip, createTimeline, ease, edgeId, Focus, Graph3D, layoutGraph, Narration, Packet, pop, pulse, Schedule, World } from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const prCronMeta = {
  id: "PrCron",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// Two lanes: the new job and what starts it, then the schedule that changed and the job it starts.
const graph = layoutGraph({
  nodes: [
    { id: "service", label: "ApiKeyService" },
    { id: "queue", label: "Queue", shape: "queue" },
    { id: "expire", label: "ExpireKeysJob", shape: "worker", change: "added" },
    { id: "clock", label: "Scheduler", shape: "clock", change: "changed" },
    { id: "sync", label: "SyncUsageJob", shape: "worker" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["service", "queue"],
    ["queue", "expire"],
    ["expire", "db"],
    ["clock", "sync"],
    ["sync", "db"],
  ],
  columnGap: 5.6,
  rowGap: 5.4,
});

const at = (id: string) => graph.position(id);
const everything = graph.nodes.map((node) => node.position);

const t = timeline;
const cue = {
  job: t.at("intro", "job"),
  changes: t.at("intro", "changes"),
  newJob: t.at("job"),
  deletes: t.at("job", "deletes"),
  puts: t.at("trigger", "puts"),
  revoked: t.at("trigger", "revoked"),
  clock: t.at("clock"),
  scheduler: t.at("clock", "scheduler"),
  starts: t.at("clock", "starts"),
  schedule: t.at("schedule"),
  hour: t.at("schedule", "fire"),
  now: t.at("schedule", "now"),
  risk: t.at("risk"),
  reads: t.at("risk", "reads"),
  twelve: t.at("risk", "twelve"),
};

const LEG = 13;

// Once the schedule is on screen, the scheduler keeps starting runs at the new pace.
const RUNS = Array.from({ length: 30 }, (_, index) => cue.now + 8 + 10 * index).filter((start) => start < timeline.durationInFrames - 2 * LEG);

export const PrCron = () => {
  const frame = useCurrentFrame();

  const hop = (from: string, to: string, start: number, extra: { label?: string; tone?: "neutral" | "accent" | "danger" } = {}) => (
    <Packet key={from + to + start} from={at(from)} to={at(to)} progress={ease(frame, start, start + LEG)} {...extra} />
  );
  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  const heavy = ease(frame, cue.reads, cue.reads + 20);
  const jobIn = cue.job - 6;

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="new file" tone="added" appear={between(cue.newJob, cue.clock)}>
            src/jobs/expireKeysJob.ts
          </Chip>
          <Chip caption="changed file" tone="changed" appear={between(cue.scheduler, t.durationInFrames + 20)}>
            config/schedule.ts
          </Chip>
          <Schedule
            title="sync_usage"
            appear={ease(frame, cue.schedule, cue.schedule + 12)}
            rows={[
              { label: "before", everyMinutes: 60, progress: ease(frame, cue.hour - 6, cue.hour + 30) },
              { label: "after", everyMinutes: 5, tone: "changed", progress: ease(frame, cue.now, cue.now + 60) },
            ]}
          />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: everything, azimuth: 10, padding: 1.05 },
          { at: cue.newJob - 6, targets: [at("service"), at("queue"), at("expire"), at("db")], azimuth: -8, padding: 1.05 },
          { at: cue.clock - 8, targets: everything, azimuth: 12, padding: 1.05 },
          { at: cue.schedule - 4, targets: everything, azimuth: 12, padding: 1.4, shift: [0, -0.1] },
        ]}
      />

      {/* From here on the story is the second lane. */}
      <Focus on={["clock", "sync", "db", edgeId("clock", "sync"), edgeId("sync", "db")]} amount={ease(frame, cue.clock - 4, cue.clock + 14)}>
        <Graph3D
          graph={graph}
          edges={{
            [edgeId("queue", "expire")]: { tone: "added", progress: ease(frame, jobIn + 6, jobIn + 20) },
            [edgeId("expire", "db")]: { tone: "added", progress: ease(frame, jobIn + 12, jobIn + 26) },
          }}
          nodes={{
            service: { active: pulse(frame, cue.puts, 20) },
            queue: { active: pulse(frame, cue.puts + LEG, 24) },
            expire: {
              appear: pop(frame, jobIn, FPS),
              active: Math.max(pulse(frame, cue.job + 4, 30), pulse(frame, cue.deletes, 24), pulse(frame, cue.revoked, 24)),
            },
            clock: { active: Math.max(pulse(frame, cue.changes, 36), pulse(frame, cue.scheduler, 30), ...RUNS.map((start) => pulse(frame, start, 8))) },
            sync: { active: Math.max(pulse(frame, cue.starts + LEG, 24), heavy), tone: heavy > 0 ? "danger" : "accent" },
            db: {
              active: Math.max(pulse(frame, cue.deletes + LEG, 24), pulse(frame, cue.revoked + LEG, 24), pulse(frame, cue.starts + 2 * LEG + 6, 24), heavy),
              tone: heavy > 0 ? "danger" : "accent",
            },
          }}
        />
      </Focus>

      {/* What the new job does, then the two hops that start it. */}
      {hop("expire", "db", cue.deletes, { tone: "accent" })}
      {hop("service", "queue", cue.puts, { label: "revoked key" })}
      {hop("queue", "expire", cue.puts + LEG + 6, { label: "revoked key" })}
      {hop("expire", "db", cue.revoked, { tone: "accent" })}

      {/* The other lane: one run on the timer, then runs at the new pace. */}
      {hop("clock", "sync", cue.starts)}
      {hop("sync", "db", cue.starts + LEG + 6, { tone: "accent" })}
      {RUNS.flatMap((start) => [hop("clock", "sync", start), hop("sync", "db", start + LEG, { tone: frame >= cue.reads ? "danger" : "accent" })])}
    </World>
  );
};
