import { useCurrentFrame } from "remotion";
import { Bars } from "../src/kit/Bars";
import { Chapter } from "../src/kit/Chapter";
import { Chat } from "../src/kit/Chat";
import { Proportion } from "../src/kit/Proportion";
import { Screenshot } from "../src/kit/Screenshot";
import { Term } from "../src/kit/Term";
import { CameraRig, ease, Focus, Graph3D, layoutGraph, Node, NODE_HEIGHT, type Vec3, World } from "../src/kit";

/** Demo scenes for the flat overlays. Each takes the values of its controls as props and loops cleanly. */

const origin: Vec3 = [0, NODE_HEIGHT / 2, 0];

const orders = layoutGraph({
  nodes: [
    { id: "api", label: "Orders API", shape: "server" },
    { id: "db", label: "Orders DB", shape: "database" },
  ],
  edges: [["api", "db"]],
});
const ordersTargets = orders.nodes.map((node) => node.position);

/** In at the start, out before the loop restarts, so the cut back to frame 0 is clean. */
const held = (frame: number, end: number) => ease(frame, 4, 16) * (1 - ease(frame, end - 14, end - 2));

/** Moves the 3D subject clear of a side panel. */
const clear = (side: "left" | "right"): [number, number] => [side === "right" ? -0.18 : 0.18, 0];

export const PROPORTION_DEMO_FRAMES = 150;

export const ProportionDemo = ({ side, part, tone }: { side: "left" | "right"; part: number; tone: "accent" | "danger" | "added" }) => {
  const frame = useCurrentFrame();
  return (
    <World
      overlay={
        <Proportion
          part={part}
          total={100}
          label="orders have a tracking number"
          tone={tone}
          side={side}
          progress={ease(frame, 20, 80)}
          appear={held(frame, PROPORTION_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: [origin], padding: 1.8, shift: clear(side) }]} />
      <Node position={origin} label="Orders" shape="database" />
    </World>
  );
};

export const BARS_DEMO_FRAMES = 150;

export const BarsDemo = ({ side, after }: { side: "left" | "right"; after: number }) => {
  const frame = useCurrentFrame();
  return (
    <World
      overlay={
        <Bars
          title="lines in reserveStock()"
          unit="lines"
          bars={[
            { label: "before", value: 40 },
            { label: "after", value: after, tone: "changed" },
          ]}
          side={side}
          progress={ease(frame, 20, 70)}
          appear={held(frame, BARS_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: [origin], padding: 1.8, shift: clear(side) }]} />
      <Node position={origin} label="reserveStock()" shape="file" change="changed" />
    </World>
  );
};

export const CHAT_DEMO_FRAMES = 210;

export const ChatDemo = ({ side, question }: { side: "left" | "right"; question: string }) => {
  const frame = useCurrentFrame();
  const thinking = frame < 90;
  return (
    <World
      overlay={
        <Chat
          side={side}
          messages={[
            { from: "user", text: question, typed: ease(frame, 14, 44) },
            {
              from: "assistant",
              text: "The stock job retried three times before the warehouse answered, so the order sat in pending for two days.",
              typed: thinking ? ease(frame, 52, 58) : Math.max(0.01, ease(frame, 90, 140)),
              pending: thinking,
            },
          ]}
          appear={held(frame, CHAT_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: ordersTargets, padding: 2.3, shift: clear(side) }]} />
      <Graph3D graph={orders} />
    </World>
  );
};

export const TERM_DEMO_FRAMES = 120;

export const TermDemo = ({ corner, term, meaning }: { corner: "bottom-left" | "bottom-right"; term: string; meaning: string }) => {
  const frame = useCurrentFrame();
  return (
    <World overlay={<Term term={term} meaning={meaning} corner={corner} appear={held(frame, TERM_DEMO_FRAMES)} />}>
      <CameraRig shots={[{ at: 0, targets: ordersTargets, padding: 1.4 }]} />
      <Graph3D graph={orders} />
    </World>
  );
};

const CHAPTER_TITLES = [
  "Where orders come from",
  "Reserving stock",
  "Charging the card",
  "When a job fails",
  "Retries and backoff",
  "Sending the email",
  "Nightly reports",
  "What it costs",
];

/** Frames per chapter in the demo: the card is up for the first half of each. */
const CHAPTER_STEP = 60;
export const CHAPTER_DEMO_FRAMES = 3 * CHAPTER_STEP;

export const ChapterDemo = ({ chapters }: { chapters: number }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / CHAPTER_STEP);
  const local = frame - step * CHAPTER_STEP;
  return (
    <World
      overlay={
        <Chapter titles={CHAPTER_TITLES.slice(0, chapters)} current={Math.min(step, chapters - 1)} appear={ease(local, 2, 12) * (1 - ease(local, 30, 40))} />
      }
    >
      <CameraRig shots={[{ at: 0, targets: ordersTargets, padding: 1.4 }]} />
      <Graph3D graph={orders} />
    </World>
  );
};

export const SCREENSHOT_DEMO_FRAMES = 210;

export const ScreenshotDemo = ({ side, width }: { side: "left" | "right" | "center"; width: number }) => {
  const frame = useCurrentFrame();
  const changed = frame >= 120;
  return (
    <World
      overlay={
        <Screenshot
          src="demo/app-before.svg"
          after="demo/app-after.svg"
          url="admin.example.com/orders"
          wipe={ease(frame, 70, 115)}
          highlight={
            changed
              ? { x: 0.815, y: 0.285, width: 0.165, height: 0.086, appear: ease(frame, 122, 136) }
              : { x: 0.715, y: 0.105, width: 0.27, height: 0.17, appear: ease(frame, 24, 38) * (1 - ease(frame, 56, 66)) }
          }
          side={side}
          width={width}
          appear={held(frame, SCREENSHOT_DEMO_FRAMES)}
        />
      }
    >
      <CameraRig shots={[{ at: 0, targets: ordersTargets, padding: side === "center" ? 1.4 : 2.4, shift: side === "center" ? [0, 0] : clear(side) }]} />
      <Focus on={[]} amount={side === "center" ? held(frame, SCREENSHOT_DEMO_FRAMES) : 0}>
        <Graph3D graph={orders} />
      </Focus>
    </World>
  );
};
