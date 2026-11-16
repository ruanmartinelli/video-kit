import { Sequence, useCurrentFrame } from "remotion";
import { Bars } from "../kit/Bars";
import { Chapter } from "../kit/Chapter";
import { Chat } from "../kit/Chat";
import { Proportion } from "../kit/Proportion";
import { Screenshot } from "../kit/Screenshot";
import { Term } from "../kit/Term";
import { CameraRig, Caption, ease, Focus, Graph3D, layoutGraph, World } from "../kit";
import { timeline } from "../videos/load-balancer/LoadBalancer";

export const overlayGalleryMeta = { id: "OverlayGallery", fps: 30, width: 1920, height: 1080, durationInFrames: 800 };

const graph = layoutGraph({
  nodes: [
    { id: "api", label: "Orders API", shape: "server" },
    { id: "db", label: "Orders DB", shape: "database" },
  ],
  edges: [["api", "db"]],
});
const targets = graph.nodes.map((node) => node.position);

// One section per component, each with the frame to itself (Term and the Chapter rail share theirs).
const PROPORTION = 0;
const BARS = 150;
const CHAT = 300;
const CHAPTER = 450;
const SCREENSHOT = 600;

const shown = (frame: number, from: number, to: number) => ease(frame, from, from + 12) * (1 - ease(frame, to - 12, to));

const chapters = ["Where orders come from", "Reserving stock", "Charging the card", "When a job fails", "What it costs"];

/** Scratch stage for looking at kit pieces while they are built. `pnpm stills OverlayGallery`. */
export const OverlayGallery = () => {
  const frame = useCurrentFrame();
  const late = frame >= PROPORTION + 90;
  const small = frame >= BARS + 90;
  const lateExport = frame >= SCREENSHOT + 130;

  return (
    <World
      overlay={
        <>
          <Proportion
            part={late ? 7 : 33}
            total={late ? 128 : 100}
            label={late ? "orders are late" : "orders have a tracking number"}
            tone={late ? "danger" : "accent"}
            cells={late ? 50 : 100}
            progress={late ? ease(frame, PROPORTION + 95, PROPORTION + 125) : ease(frame, PROPORTION + 12, PROPORTION + 70)}
            appear={shown(frame, PROPORTION, BARS)}
          />
          <Bars
            title={small ? "p99 latency, GET /orders" : "lines in reserveStock()"}
            unit={small ? "ms" : "lines"}
            bars={
              small
                ? [
                    { label: "cold", value: 840, tone: "neutral" },
                    { label: "warm", value: 120, tone: "neutral" },
                    { label: "cached", value: 4, tone: "added" },
                    { label: "old cache", value: 310, tone: "removed" },
                  ]
                : [
                    { label: "before", value: 40 },
                    { label: "after", value: 3, tone: "changed" },
                  ]
            }
            progress={small ? ease(frame, BARS + 92, BARS + 125) : ease(frame, BARS + 14, BARS + 60)}
            side="left"
            appear={shown(frame, BARS, CHAT)}
          />
          <Chat
            messages={[
              { from: "user", text: "Why did order #1040 ship late?", typed: ease(frame, CHAT + 12, CHAT + 34) },
              {
                from: "assistant",
                text: "The stock job retried three times before the warehouse answered, so the order sat in pending for two days.",
                typed: frame < CHAT + 75 ? ease(frame, CHAT + 40, CHAT + 46) : Math.max(0.01, ease(frame, CHAT + 75, CHAT + 115)),
                pending: frame < CHAT + 75,
              },
              { from: "user", text: "Can the job time out sooner?", typed: ease(frame, CHAT + 120, CHAT + 135) },
            ]}
            appear={shown(frame, CHAT, CHAPTER)}
          />
          <Chapter
            titles={chapters}
            current={frame < CHAPTER + 110 ? 1 : 2}
            appear={shown(frame, CHAPTER + 2, CHAPTER + 70)}
            rail={frame >= CHAPTER && frame < SCREENSHOT}
          />
          <Term
            term={frame < CHAPTER + 110 ? "idempotent" : "outbox"}
            meaning={frame < CHAPTER + 110 ? "safe to run twice, same result" : "a table of events waiting to be sent"}
            corner={frame < CHAPTER + 110 ? "bottom-left" : "bottom-right"}
            appear={ease(frame, CHAPTER + 72, CHAPTER + 84) * (1 - ease(frame, SCREENSHOT - 12, SCREENSHOT))}
          />
          <Sequence from={CHAPTER} durationInFrames={SCREENSHOT - CHAPTER}>
            <Caption timeline={timeline} />
          </Sequence>
          <Screenshot
            src="demo/app-before.svg"
            after="demo/app-after.svg"
            url="admin.example.com/orders"
            wipe={ease(frame, SCREENSHOT + 70, SCREENSHOT + 120)}
            highlight={
              lateExport
                ? { x: 0.815, y: 0.285, width: 0.165, height: 0.086, appear: ease(frame, SCREENSHOT + 130, SCREENSHOT + 145) }
                : {
                    x: 0.715,
                    y: 0.105,
                    width: 0.27,
                    height: 0.17,
                    appear: ease(frame, SCREENSHOT + 25, SCREENSHOT + 40) * (1 - ease(frame, SCREENSHOT + 60, SCREENSHOT + 70)),
                  }
            }
            appear={ease(frame, SCREENSHOT, SCREENSHOT + 14)}
          />
        </>
      }
    >
      <CameraRig
        shots={[
          { at: 0, targets, padding: 2.2, shift: [-0.14, 0] },
          { at: BARS, targets, padding: 2.2, shift: [0.16, 0] },
          { at: CHAT, targets, padding: 2.4, shift: [-0.2, 0] },
          { at: CHAPTER, targets, padding: 1.2 },
          { at: SCREENSHOT, targets, padding: 2.8 },
        ]}
      />
      {/* The screenshot wants the frame: the scene behind it dims so its labels stop competing. */}
      <Focus on={[]} amount={ease(frame, SCREENSHOT, SCREENSHOT + 14)}>
        <Graph3D graph={graph} />
      </Focus>
    </World>
  );
};
