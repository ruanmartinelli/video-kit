import { useCurrentFrame } from "remotion";
import {
  CameraRig,
  Caption,
  Chip,
  CodePanel,
  createTimeline,
  ease,
  edgeId,
  Focus,
  Graph3D,
  layoutHub,
  Narration,
  Outcomes,
  Packet,
  pop,
  pulse,
  Ripple,
  World,
} from "../../kit";
import narration from "./narration.json";

const FPS = 30;

export const timeline = createTimeline(narration, { fps: FPS });

export const prSharedMeta = {
  id: "PrShared",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInFrames: timeline.durationInFrames,
};

// Every file that calls the helper. `inPr` is whether this PR updated it.
const CALLERS = [
  { id: "payout", label: "PayoutExport", inPr: false },
  { id: "receipt", label: "ReceiptPdf", inPr: false },
  { id: "tax", label: "TaxSummary", inPr: false },
  { id: "refund", label: "RefundJob", inPr: false },
  { id: "cart", label: "CartController", inPr: true },
  { id: "checkout", label: "CheckoutService", inPr: true },
  { id: "email", label: "CartEmail", inPr: true },
  { id: "reports", label: "AdminReports", inPr: false },
];
const inside = CALLERS.filter((caller) => caller.inPr);
const outside = CALLERS.filter((caller) => !caller.inPr);

const graph = layoutHub({
  hub: { id: "helper", label: "formatMoney()", shape: "file", change: "changed" },
  spokes: CALLERS.map((caller) => ({ id: caller.id, label: caller.label, shape: "file", change: caller.inPr ? "changed" : undefined })),
});

const helper = graph.position("helper");
const cart = graph.position("cart");
const payout = graph.position("payout");
const everything = graph.nodes.map((node) => node.position);

const t = timeline;
const cue = {
  cents: t.at("intro", "cents"),
  helper: t.at("helper"),
  changing: t.at("helper", "changing"),
  format: t.at("helper", "format"),
  change: t.at("change"),
  amount: t.at("change", "amount"),
  different: t.at("change", "different"),
  callers: t.at("callers"),
  three: t.at("inside", "three"),
  other: t.at("outside", "other"),
  risk: t.at("risk"),
  payout: t.at("risk", "payout"),
  string: t.at("risk", "string"),
  bank: t.at("risk", "bank"),
};

const LEG = 16;
// The ripple's front moves at a steady pace and is at the callers 85% of the way out.
const RIPPLE = 62;
const reached = cue.other + RIPPLE * 0.85;

const dollars = (cents: number) => "$" + (cents / 100).toFixed(2);
const rounded = (cents: number) => "$" + Math.round(cents / 100);

const CODE = `
for (const payout of payouts) {
  row.amount = formatMoney(payout.cents);
  rows.push(row);
}
await bank.upload(toCsv(rows));
`;

export const PrShared = () => {
  const frame = useCurrentFrame();

  const between = (from: number, to: number) => ease(frame, from - 6, from + 6) * (1 - ease(frame, to - 10, to));
  const codeIn = ease(frame, cue.payout + 10, cue.payout + 24);
  // The cart is on screen from the start: it is the caller this PR is about. The rest arrive when they are counted.
  const arrives = (id: string) => (id === "cart" ? -FPS : cue.callers + 3 + 4 * CALLERS.findIndex((caller) => caller.id === id));

  return (
    <World
      overlay={
        <>
          <Narration timeline={timeline} />
          <Chip caption="changed file" tone="changed" appear={between(cue.changing, cue.risk)}>
            src/lib/formatMoney.ts
          </Chip>
          <Chip caption="not in this PR" appear={between(cue.payout, t.durationInFrames + 20)}>
            src/payouts/payoutExport.ts
          </Chip>
          <Outcomes
            heading="input"
            appear={between(cue.change, cue.callers)}
            rows={[1250, 1200].map((cents, row) => ({
              name: "formatMoney(" + cents + ")",
              before: dollars(cents),
              after: rounded(cents),
              filled: ease(frame, cue.amount + 6 * row, cue.amount + 10 + 6 * row) + ease(frame, cue.different + 6 * row, cue.different + 10 + 6 * row),
            }))}
          />
          <CodePanel code={CODE} title="payoutExport.ts" highlight={frame < cue.bank - 6 ? [2] : [2, 5]} appear={codeIn} />
          <Caption timeline={timeline} />
        </>
      }
    >
      <CameraRig
        graph={graph}
        shots={[
          { at: 0, targets: [cart, helper], azimuth: -12, padding: 1.25 },
          { at: cue.helper - 6, targets: [helper], view: "close", azimuth: 14, padding: 2.2 },
          { at: cue.change - 8, targets: [helper], view: "close", azimuth: 14, padding: 2, shift: [-0.24, 0.02] },
          { at: cue.callers - 8, targets: everything, elevation: 44, padding: 1.08, shift: [0, 0.1] },
          { at: cue.risk - 6, targets: [helper, payout], azimuth: -20, padding: 2.3, shift: [-0.22, 0.02] },
        ]}
      />

      <Ripple at={helper} progress={Math.min(1, Math.max(0, (frame - cue.other) / RIPPLE))} />

      <Focus on={["helper", "payout", edgeId("payout", "helper")]} amount={codeIn}>
        <Graph3D
          graph={graph}
          edges={Object.fromEntries(CALLERS.map((caller) => [edgeId(caller.id, "helper"), ease(frame, arrives(caller.id) + 4, arrives(caller.id) + 16)]))}
          nodes={{
            helper: { active: Math.max(pulse(frame, cue.cents + LEG, 24), pulse(frame, cue.format, 40), pulse(frame, cue.other, 30)) },
            ...Object.fromEntries(
              inside.map((caller, index) => [
                caller.id,
                {
                  appear: pop(frame, arrives(caller.id), FPS),
                  active: Math.max(pulse(frame, cue.three + 5 * index, 36), caller.id === "cart" ? pulse(frame, cue.cents + 2 * LEG, 24) : 0),
                },
              ]),
            ),
            ...Object.fromEntries(
              outside.map((caller) => [
                caller.id,
                {
                  appear: pop(frame, arrives(caller.id), FPS),
                  active: ease(frame, reached - 4, reached + 8),
                  tone: frame >= reached - 4 ? ("danger" as const) : ("accent" as const),
                },
              ]),
            ),
          }}
        />
      </Focus>

      {/* The cart asks for a price and gets it back without cents. */}
      <Packet from={cart} to={helper} progress={ease(frame, cue.cents, cue.cents + LEG)} label="1250" />
      <Packet from={helper} to={cart} progress={ease(frame, cue.cents + LEG, cue.cents + 2 * LEG)} label="$13" tone="accent" />

      {/* The payout export gets the same answer, and passes it on. */}
      <Packet from={helper} to={payout} progress={ease(frame, cue.string - LEG, cue.string)} label="$13" tone="danger" />
    </World>
  );
};
