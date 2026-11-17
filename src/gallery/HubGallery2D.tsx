import { useCurrentFrame } from "remotion";
import { CameraRig, Focus, Graph, layoutHub, pulse, Ripple, World } from "../kit2d";

export const hubGallery2DMeta = { id: "HubGallery2D", fps: 30, width: 1920, height: 1080, durationInFrames: 150 };

const graph = layoutHub({
  hub: { id: "helper", label: "formatMoney()", shape: "file", change: "changed" },
  spokes: ["Checkout", "Invoices", "Cart", "Refunds", "Reports", "Payouts", "Receipts", "Taxes"].map((name) => ({
    id: name,
    label: name,
    shape: "file" as const,
  })),
});

/** A hub with a ripple, flat, with the rig written inside a Focus. `pnpm stills HubGallery2D 20,60,90,120 --sheet`. */
export const HubGallery2D = () => {
  const frame = useCurrentFrame();
  return (
    <World>
      <Focus on={graph.nodes.map((node) => node.id)} amount={0}>
        <CameraRig graph={graph} shots={[{ at: 0, targets: graph.nodes.map((node) => node.position) }]} />
        <Ripple at={graph.position("helper")} progress={Math.min(1, Math.max(0, (frame - 30) / 80))} />
        <Graph graph={graph} nodes={{ Payouts: { active: pulse(frame, 98, 30), tone: "danger" } }} />
      </Focus>
    </World>
  );
};
