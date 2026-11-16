import { useCurrentFrame } from "remotion";
import {
  Callout,
  CameraRig,
  Caption,
  Chip,
  CodePanel,
  createTimeline,
  ease,
  EventTimeline,
  Focus,
  Gate,
  gatePoint,
  Graph3D,
  layoutGraph,
  Meter,
  Narration,
  NODE_CLEAR,
  Packet,
  pop,
  pulse,
  RecordCard,
  World,
  type Vec3,
} from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const bugLowStockMeta = {
  id: "BugLowStock",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// One order, followed from the app to the email it should never have caused.
const graph = layoutGraph({
  nodes: [
    { id: "app", label: "Shop app", shape: "phone" },
    { id: "api", label: "Orders API", shape: "server" },
    { id: "db", label: "Postgres", shape: "database" },
    { id: "trigger", label: "trigger", shape: "trigger" },
    { id: "job", label: "AlertJob", shape: "worker" },
    { id: "mail", label: "Email", shape: "notification" },
  ],
  edges: [
    ["app", "api"],
    ["api", "db"],
    ["db", "trigger"],
    ["trigger", "job"],
    ["job", "mail"],
  ],
  columnGap: 4.8,
});

const at = (id: string) => graph.position(id);
const everything = graph.nodes.map((node) => node.position);
const gate = gatePoint(at("trigger"), at("job"));

const t = timeline;
const cue = {
  alert: t.at("alert", "alert"),
  stock: t.at("stock"),
  order: t.at("order", "order"),
  writes: t.at("writes"),
  releases: t.at("writes", "releases"),
  reserves: t.at("writes", "reserves"),
  trigger: t.at("trigger"),
  each: t.at("trigger", "each"),
  question: t.at("trigger", "question"),
  first: t.at("first"),
  passes: t.at("first", "passes"),
  second: t.at("second"),
  turned: t.at("second", "turned"),
  day: t.at("day"),
  none: t.at("day", "none"),
  fix: t.at("fix"),
  whole: t.at("fix", "whole"),
  replay: t.at("replay"),
  again: t.at("replay", "again"),
  quiet: t.at("quiet"),
  crosses: t.at("quiet", "crosses"),
  real: t.at("real"),
  still: t.at("real", "still"),
  cost: t.at("cost"),
  hold: t.at("cost", "hold"),
};

const LEG = 14;

// Each write reaches the gate as an event of its own. `reach` is the frame it is at the ring.
const CHECKS = [
  { reach: cue.passes, label: "qty 0", passes: true, tone: "danger" },
  { reach: cue.turned, label: "qty 110", passes: false, tone: "neutral" },
  { reach: cue.crosses, label: "120 to 110", passes: false, tone: "neutral" },
  { reach: cue.still - LEG - 4, label: "120 to 90", passes: true, tone: "accent" },
] as const;
const [falseAlarm, , , realDrop] = CHECKS;
/** Frame the email goes out after a check that passed. */
const sent = (reach: number) => reach + 2 * LEG + 4;

// One day of orders for this product. Every one of them sent an alert.
const DAY: [number, number] = [8 * 60, 18 * 60];
const ORDERS = [9 * 60 + 10, 10 * 60 + 40, 12 * 60 + 5, 13 * 60 + 30, 15 * 60 + 15, 16 * 60 + 50];
const dayFrames = cue.none - cue.day - 6;
const orderFrame = (minute: number) => cue.day + 6 + ((minute - DAY[0]) / (DAY[1] - DAY[0])) * dayFrames;

const CODE = `
onCommit((writes) => {
  for (const w of writes) check(w.before, w.after);
  check(writes[0].before, writes.at(-1).after);
});
`;

export const BugLowStock = () => {
  const frame = useCurrentFrame();

  const hop = (from: Vec3, to: Vec3, start: number, extra: { label?: string; tone?: "neutral" | "accent" | "danger"; clear?: [number, number] } = {}) => (
    <Packet key={`${from[0]}${to[0]}${start}`} from={from} to={to} progress={ease(frame, start, start + LEG)} {...extra} />
  );
  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  const codeIn = between(cue.fix, cue.replay - 4);

  const refused = Math.max(...CHECKS.filter((check) => !check.passes).map((check) => pulse(frame, check.reach, 26)));
  const allowed = Math.max(...CHECKS.filter((check) => check.passes).map((check) => pulse(frame, check.reach, 26)));
  // The alert that should not exist stays lit until the story moves on to how often it happened.
  const wrongAlert = Math.max(
    pulse(frame, cue.alert, 50),
    ease(frame, sent(falseAlarm.reach) + LEG - 2, sent(falseAlarm.reach) + LEG + 6) * (1 - ease(frame, cue.day - 12, cue.day)),
  );
  const dayAlerts = Math.max(...ORDERS.map((minute) => pulse(frame, orderFrame(minute), 12)));
  const rightAlert = pulse(frame, sent(realDrop.reach) + LEG, 60);

  const secondWrite = frame >= cue.second - 6;
  const judgedWhole = frame >= cue.real - 6;

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="the trigger" appear={between(cue.trigger, cue.fix - 4)}>
            src/stock/alertTrigger.ts
          </Chip>
          <Chip caption="changed file" tone="changed" appear={between(cue.fix + 4, t.durationInFrames + 20)}>
            src/stock/alertTrigger.ts
          </Chip>
          <Meter
            label="available"
            value={120 - 120 * ease(frame, cue.releases, cue.releases + 12) + 110 * ease(frame, cue.reserves, cue.reserves + 12)}
            max={150}
            limit={100}
            limitLabel="minimum"
            unit="units"
            appear={between(cue.stock, cue.trigger - 4)}
          />
          <RecordCard
            caption={secondWrite ? "write 2 of 2" : "write 1 of 2"}
            title="stock, product 7"
            appear={between(cue.first, cue.day - 4)}
            fields={[
              secondWrite
                ? { name: "qty", value: "110", was: "0", flip: ease(frame, cue.second + 4, cue.second + 16), lit: pulse(frame, cue.turned, 30) }
                : { name: "qty", value: "0", was: "120", flip: ease(frame, cue.first + 4, cue.first + 16), lit: pulse(frame, cue.passes, 30) },
              { name: "minimum", value: "100" },
            ]}
          />
          <EventTimeline
            title="low stock alerts, one day"
            window={DAY}
            ticks={[
              { at: 9 * 60, label: "09:00" },
              { at: 13 * 60, label: "13:00" },
              { at: 17 * 60, label: "17:00" },
            ]}
            events={ORDERS.map((minute) => ({ at: minute, tone: "danger" as const }))}
            legend={{ danger: "false alarms" }}
            playhead={ease(frame, cue.day + 6, cue.none)}
            appear={between(cue.day, cue.fix - 4)}
          />
          <CodePanel code={CODE} title="alertTrigger.ts" removed={[2]} added={frame >= cue.whole - 4 ? [3] : []} appear={codeIn} />
          <RecordCard
            caption="the whole save"
            title="stock, product 7"
            appear={between(cue.quiet, cue.cost - 4)}
            fields={[
              judgedWhole
                ? { name: "qty", value: "90", was: "120", flip: ease(frame, cue.real + 4, cue.real + 16), lit: pulse(frame, realDrop.reach, 30) }
                : { name: "qty", value: "110", was: "120", flip: ease(frame, cue.quiet + 4, cue.quiet + 16), lit: pulse(frame, cue.crosses, 30) },
              { name: "minimum", value: "100" },
            ]}
          />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: everything, azimuth: 6, padding: 1, shift: [0, -0.02] },
          { at: cue.stock - 8, targets: [at("app"), at("api"), at("db")], azimuth: -6, panel: "right" },
          { at: cue.trigger - 8, targets: [at("db"), at("trigger"), at("job"), at("mail")], azimuth: 12, panel: "right" },
          { at: cue.day - 8, targets: [at("trigger"), at("job"), at("mail")], azimuth: 10, panel: "right" },
          { at: cue.fix - 8, targets: [at("trigger")], view: "close", azimuth: 16, padding: 2.2, panel: "right" },
          { at: cue.replay - 8, targets: [at("db"), at("trigger"), at("job"), at("mail")], azimuth: 12, panel: "right" },
          { at: cue.cost - 8, targets: everything, azimuth: 2, padding: 1, shift: [0, -0.04] },
        ]}
      />

      <Focus on={["trigger"]} amount={codeIn}>
        <Graph3D
          graph={graph}
          nodes={{
            api: { active: Math.max(pulse(frame, cue.order + LEG, 20), pulse(frame, cue.replay + LEG, 20)) },
            db: {
              active: Math.max(pulse(frame, cue.releases, 18), pulse(frame, cue.reserves, 18), pulse(frame, cue.again, 14), pulse(frame, cue.again + 10, 14)),
            },
            trigger: {
              active: Math.max(
                pulse(frame, cue.each, 30),
                pulse(frame, cue.whole, 40),
                pulse(frame, cue.hold, 50),
                ...CHECKS.map((check) => pulse(frame, check.reach - LEG, 14)),
              ),
            },
            job: { active: Math.max(...CHECKS.filter((check) => check.passes).map((check) => pulse(frame, check.reach + LEG, 20))) },
            mail: {
              active: Math.max(wrongAlert, dayAlerts, rightAlert),
              tone: frame < cue.fix ? "danger" : "accent",
            },
          }}
        />
        <Gate
          id="gate"
          from={at("trigger")}
          to={at("job")}
          rule="qty < 100"
          appear={pop(frame, cue.question - 6, FPS)}
          active={Math.max(refused, allowed)}
          tone={refused > allowed ? "danger" : "accent"}
        />
      </Focus>

      {/* What the team saw. */}
      {hop(at("job"), at("mail"), cue.alert - LEG, { label: "low stock", tone: "danger" })}

      {/* The order, and the two writes its save makes. */}
      {hop(at("app"), at("api"), cue.order, { label: "order: 10" })}
      {hop(at("api"), at("db"), cue.releases - LEG, { label: "write 1" })}
      {hop(at("api"), at("db"), cue.reserves - LEG, { label: "write 2" })}

      {/* The same order after the fix. */}
      {hop(at("app"), at("api"), cue.replay, { label: "order: 10" })}
      {hop(at("api"), at("db"), cue.again - LEG, { label: "write 1" })}
      {hop(at("api"), at("db"), cue.again - LEG + 10, { label: "write 2" })}

      {/* Every event the trigger raises goes to the gate, then on or back. */}
      {CHECKS.map(({ reach, label, passes, tone }) => (
        <group key={reach}>
          {hop(at("db"), at("trigger"), reach - 2 * LEG, { label, tone })}
          {hop(at("trigger"), gate, reach - LEG, { label, tone, clear: [NODE_CLEAR, 0] })}
          {/* One frame early: a Packet is hidden at exactly 0 and 1. */}
          {hop(gate, at(passes ? "job" : "trigger"), reach - 1, { label, tone, clear: [0, NODE_CLEAR] })}
          {passes ? hop(at("job"), at("mail"), sent(reach), { label: "low stock", tone }) : null}
        </group>
      ))}

      {/* A day of orders: each one, an email. */}
      {ORDERS.map((minute) => hop(at("job"), at("mail"), orderFrame(minute) - LEG, { tone: "danger" }))}

      <Callout at={[at("trigger")[0], at("trigger")[1] + 0.2, at("trigger")[2]]} offset={[1.4, -1.9]} appear={between(cue.hold - 4, t.durationInFrames + 20)}>
        keeps writes until commit
      </Callout>
    </World>
  );
};
