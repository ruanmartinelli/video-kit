import { useCurrentFrame } from "remotion";
import { CameraRig, Caption, Chip, createTimeline, ease, edgeId, Graph3D, layoutGraph, Narration, Packet, pop, pulse, Tables, World } from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const prGraphqlMeta = {
  id: "PrGraphql",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// A resolver is a file between the GraphQL server and the database.
const graph = layoutGraph({
  nodes: [
    { id: "server", label: "GraphQL", shape: "server" },
    { id: "users", label: "users", shape: "file" },
    { id: "keys", label: "User.apiKeys", shape: "file", change: "added" },
    { id: "db", label: "Postgres", shape: "database" },
  ],
  edges: [
    ["server", "users"],
    ["server", "keys"],
    ["users", "db"],
    ["keys", "db"],
  ],
  columnGap: 5.4,
  rowGap: 5,
});

const at = (id: string) => graph.position(id);

const t = timeline;
const cue = {
  schema: t.at("intro", "schema"),
  mutation: t.at("mutation", "mutation"),
  create: t.at("mutation", "create"),
  field: t.at("field", "field"),
  keys: t.at("field", "keys"),
  asks: t.at("query", "asks"),
  database: t.at("query", "database"),
  returns: t.at("query", "returns"),
  runs: t.at("fanout", "runs"),
  more: t.at("fanout", "more"),
  risk: t.at("risk"),
  hundred: t.at("risk", "hundred"),
  queries: t.at("risk", "queries"),
};

const LEG = 13;

// One query for the list, then one per user for the new field.
const listQuery = cue.database - LEG;
const USERS = [0, 1, 2].map((index) => ({ label: "user " + (index + 1), call: cue.runs + 9 * index, query: cue.more - LEG - 4 + 9 * index }));
// The same thing on a page of a hundred: too many to follow, which is the point.
const BURST = Array.from({ length: 26 }, (_, index) => cue.hundred + 3 * index);
const burstEnd = BURST[BURST.length - 1]! + LEG;

export const PrGraphql = () => {
  const frame = useCurrentFrame();

  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  const landed = (start: number) => (frame >= start + LEG ? 1 : 0);
  const counted = landed(listQuery) + USERS.reduce((sum, user) => sum + landed(user.query), 0);
  const queries = frame < cue.hundred ? counted : Math.round(4 + 97 * ease(frame, cue.hundred + LEG, burstEnd));
  const swamped = ease(frame, cue.hundred + LEG, cue.queries);

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="changed file" tone="changed" appear={between(cue.schema, cue.asks - 20)}>
            schema.graphql
          </Chip>
          <Chip caption="new file" tone="added" appear={between(cue.asks - 14, t.durationInFrames + 20)}>
            src/resolvers/userApiKeys.ts
          </Chip>
          <Chip
            caption="database queries"
            corner="top-right"
            tone={swamped > 0 ? "removed" : "neutral"}
            appear={between(cue.database, t.durationInFrames + 20)}
          >
            {String(queries)}
          </Chip>
          <Tables
            side="left"
            appear={ease(frame, cue.schema - 10, cue.schema + 4)}
            tables={[
              {
                name: "type Mutation",
                columns: [
                  { name: "createUser", type: "User!" },
                  {
                    name: "createApiKey",
                    type: "ApiKey!",
                    change: "added",
                    appear: ease(frame, cue.mutation - 6, cue.mutation + 10),
                    lit: pulse(frame, cue.create, 40),
                  },
                ],
              },
              {
                name: "type User",
                columns: [
                  { name: "id", type: "ID!" },
                  { name: "email", type: "String!" },
                  {
                    name: "apiKeys",
                    type: "[ApiKey!]!",
                    change: "added",
                    appear: ease(frame, cue.field - 6, cue.field + 10),
                    lit: Math.max(pulse(frame, cue.keys, 40), ...USERS.map((user) => pulse(frame, user.call + LEG, 16)), swamped),
                  },
                ],
              },
            ]}
          />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig shots={[{ at: 0, targets: graph.nodes.map((node) => node.position), azimuth: -8, padding: 1.34, shift: [0.18, 0] }]} />

      <Graph3D
        graph={graph}
        edges={{
          [edgeId("server", "keys")]: { tone: "added", progress: ease(frame, cue.field + 6, cue.field + 22) },
          [edgeId("keys", "db")]: { tone: "added", progress: ease(frame, cue.field + 14, cue.field + 30) },
        }}
        nodes={{
          server: { active: Math.max(pulse(frame, cue.asks - LEG, 20), pulse(frame, cue.runs, 20)) },
          users: { active: Math.max(pulse(frame, cue.asks, 20), pulse(frame, cue.returns + LEG, 24)) },
          keys: {
            appear: pop(frame, cue.field, FPS),
            active: Math.max(pulse(frame, cue.keys, 30), ...USERS.map((user) => pulse(frame, user.call + LEG, 14)), swamped),
            tone: swamped > 0 ? "danger" : "accent",
          },
          db: {
            active: Math.max(pulse(frame, listQuery + LEG, 18), ...USERS.map((user) => pulse(frame, user.query + LEG, 14)), swamped),
            tone: swamped > 0 ? "danger" : "accent",
          },
        }}
      />

      <Packet from={at("server")} to={at("users")} progress={ease(frame, cue.asks - LEG, cue.asks)} label="users" tone="accent" />
      <Packet from={at("users")} to={at("db")} progress={ease(frame, listQuery, listQuery + LEG)} label="1 query" tone="accent" />
      <Packet from={at("db")} to={at("users")} progress={ease(frame, cue.returns, cue.returns + LEG)} label="3 users" />

      {USERS.map((user) => (
        <group key={user.label}>
          <Packet from={at("server")} to={at("keys")} progress={ease(frame, user.call, user.call + LEG)} label={user.label} />
          <Packet from={at("keys")} to={at("db")} progress={ease(frame, user.query, user.query + LEG)} label={user.label} tone="accent" />
        </group>
      ))}

      {BURST.map((start) => (
        <Packet key={start} from={at("keys")} to={at("db")} progress={ease(frame, start, start + LEG)} tone="danger" />
      ))}
    </World>
  );
};
