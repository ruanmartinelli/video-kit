import { useCurrentFrame } from "remotion";
import { CameraRig, Caption, Chip, CodePanel, createTimeline, ease, Graph3D, layoutGraph, Narration, Packet, pop, pulse, Tables, World } from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const apiKeysMeta = {
  id: "ApiKeys",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// The request path. `change` marks what this PR touched.
const graph = layoutGraph({
  nodes: [
    { id: "client", label: "Client", shape: "client" },
    { id: "router", label: "Router", shape: "router", change: "changed" },
    { id: "controller", label: "ApiKeysController", shape: "controller", change: "added" },
    { id: "service", label: "ApiKeyService", change: "added" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["client", "router"],
    ["router", "controller"],
    ["controller", "service"],
    ["service", "db"],
  ],
  columnGap: 5,
});

const service = graph.position("service");
const db = graph.position("db");
const path = graph.nodes.map((node) => node.position);

const t = timeline;
const cue = {
  touched: t.at("touched", "new"),
  schema: t.at("schema"),
  create: t.at("create"),
  table: t.at("create", "table"),
  hash: t.at("create", "hash"),
  links: t.at("create", "links"),
  alter: t.at("alter"),
  limit: t.at("alter", "limit"),
  notNull: t.at("alter", "null"),
  request: t.at("request"),
  posts: t.at("request", "posts"),
  controller: t.at("request", "controller"),
  service: t.at("request", "service"),
  read: t.at("read"),
  reads: t.at("read", "reads"),
  write: t.at("write"),
  inserts: t.at("write", "inserts"),
  risk: t.at("risk"),
  separate: t.at("risk", "separate"),
  insertWord: t.at("risk", "insert"),
  both: t.at("risk", "both"),
};

const LEG = 14;

const CODE = `
async function createKey(userId) {
  const user = await users.find(userId);
  const count = await apiKeys.count(userId);
  if (count >= user.apiKeyLimit) {
    throw new TooManyKeys();
  }

  const key = generateKey();
  await apiKeys.insert(userId, sha256(key));
  return key;
}
`;

export const ApiKeys = () => {
  const frame = useCurrentFrame();

  // A query is a packet from the service to the database. The row it touches lights when it lands.
  const query = (start: number, tone: "accent" | "danger" = "accent") => (
    <Packet key={start} from={service} to={db} progress={ease(frame, start, start + LEG)} tone={tone} />
  );
  const lands = (start: number) => start + LEG;

  const readLimit = cue.reads - LEG;
  const readCount = cue.reads + 12;
  const insert = cue.inserts;
  const race = [cue.both - LEG, cue.both - LEG + 5];

  const users = {
    name: "users",
    columns: [
      { name: "id", type: "bigint pk" },
      { name: "email", type: "text" },
      {
        name: "api_key_limit",
        type: "int not null = 5",
        change: "added" as const,
        appear: ease(frame, cue.limit - 6, cue.limit + 10),
        lit: Math.max(pulse(frame, cue.notNull, 30), pulse(frame, lands(readLimit), 30)),
      },
    ],
  };
  const apiKeys = {
    name: "api_keys",
    change: "added" as const,
    appear: pop(frame, cue.table, FPS),
    columns: [
      { name: "id", type: "bigint pk", lit: pulse(frame, lands(insert), 30) },
      {
        name: "user_id",
        type: "bigint → users.id",
        lit: Math.max(pulse(frame, cue.links, 30), pulse(frame, lands(readCount), 30), pulse(frame, lands(insert), 30)),
      },
      { name: "key_hash", type: "text not null", lit: Math.max(pulse(frame, cue.hash, 30), pulse(frame, lands(insert), 40)) },
      { name: "created_at", type: "timestamptz", lit: pulse(frame, lands(insert), 30) },
    ],
  };

  const inFlow = frame >= cue.read;
  const codeIn = ease(frame, cue.risk + 4, cue.risk + 18);
  const codeLines = frame < cue.insertWord ? [2, 3, 4] : [2, 3, 4, 9];
  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  // The tables step aside for the wide shot of the request path, and for the code at the end.
  const tablesIn = Math.max(between(cue.schema + 6, cue.request), between(cue.read, cue.risk + 4));

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="migration 1 of 2" tone="added" appear={between(cue.create, cue.alter)}>
            20261114_create_api_keys.sql
          </Chip>
          <Chip caption="migration 2 of 2" tone="changed" appear={between(cue.alter, cue.request)}>
            20261115_add_api_key_limit_to_users.sql
          </Chip>
          <Chip caption="new route" tone="added" appear={between(cue.posts, cue.read)}>
            POST /api-keys
          </Chip>
          <Chip caption="new file" tone="added" appear={between(cue.read, t.durationInFrames + 20)}>
            src/services/apiKeyService.ts
          </Chip>
          <Tables
            tables={[users, apiKeys]}
            links={[{ from: "api_keys.user_id", to: "users.id", tone: "added", progress: ease(frame, cue.links - 4, cue.links + 14) }]}
            appear={tablesIn}
          />
          <CodePanel code={CODE} title="createKey" highlight={codeLines} appear={codeIn} />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: path, azimuth: 8 },
          { at: cue.schema - 8, targets: [service, db], azimuth: -14, padding: 1.75, shift: [-0.16, 0] },
          { at: cue.request - 10, targets: path, azimuth: 10 },
          { at: cue.read - 12, targets: [service, db], azimuth: 6, padding: 1.75, shift: [-0.16, 0] },
          { at: cue.risk - 6, targets: [service, db], view: "close", azimuth: -16, padding: 1.9, shift: [-0.25, 0.05] },
        ]}
      />

      <Graph3D
        graph={graph}
        nodes={{
          router: { active: Math.max(pulse(frame, cue.touched, 30), pulse(frame, cue.posts + LEG, 20)) },
          controller: { active: Math.max(pulse(frame, cue.touched + 6, 30), pulse(frame, cue.controller, 24)) },
          service: {
            active: Math.max(pulse(frame, cue.touched + 12, 30), pulse(frame, cue.service, 24), ease(frame, cue.separate - 4, cue.separate + 8)),
            tone: frame >= cue.risk ? "danger" : "accent",
          },
          db: {
            active: Math.max(
              pulse(frame, cue.table, 30),
              pulse(frame, cue.limit, 30),
              ...[readLimit, readCount, insert].map((start) => pulse(frame, lands(start), 20)),
            ),
          },
        }}
      />

      <Packet from={graph.position("client")} to={graph.position("router")} progress={ease(frame, cue.posts, cue.posts + LEG)} />
      <Packet from={graph.position("router")} to={graph.position("controller")} progress={ease(frame, cue.controller - LEG, cue.controller)} />
      <Packet from={graph.position("controller")} to={service} progress={ease(frame, cue.service - LEG, cue.service)} />

      {inFlow ? (
        <>
          {query(readLimit)}
          {query(readCount)}
          {query(insert)}
          {race.map((start) => query(start, "danger"))}
        </>
      ) : null}
    </World>
  );
};
