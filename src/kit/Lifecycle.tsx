import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const lifecycleStateSchema = z.object({
  name: z.string().describe("The state as the code spells it: `Pending`, `Paid`. One or two words."),
  tone: z.enum(["neutral", "danger"]).default("neutral").describe("danger for a state the record should not end in: `Canceled`, `Failed`."),
});

export const lifecycleSchema = z.object({
  states: z.array(lifecycleStateSchema).min(2).max(6).describe("The states in the order a record moves through them, left to right."),
  current: z
    .number()
    .min(0)
    .describe(
      "Index of the state the record is in. A fractional value puts the marker between two states, so ease() from one index to the next moves it; the state nearest the marker is lit.",
    ),
  title: z.string().optional().describe("Which record this is: `order 1042`."),
  side: z.enum(["left", "right"]).default("right").describe("Name this side in the CameraRig shot's `panel`, and the rig keeps the 3D subject clear of it."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type LifecycleProps = z.input<typeof lifecycleSchema>;

const CELL = 200;
const GAP = 52;
const MARKER = 18;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const Arrow = () => (
  <svg width={GAP} height={20} viewBox={`0 0 ${GAP} 20`} style={{ flexShrink: 0 }}>
    <path
      d={`M8 10 H${GAP - 10} M${GAP - 18} 3 L${GAP - 10} 10 L${GAP - 18} 17`}
      fill="none"
      stroke={theme.textDim}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The states one record moves through, in a row. States it has passed read as
 * visited, the one it is in is outlined, and a marker travels between them.
 * Goes in World's `overlay`.
 */
export const Lifecycle = (props: LifecycleProps) => {
  const { states, current: raw, title, side, appear } = lifecycleSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const current = Math.min(raw, states.length - 1);
  const slide = (1 - appear) * (side === "right" ? 60 : -60);
  const toneOf = (index: number) => (states[index]?.tone === "danger" ? theme.danger : theme.accent);
  const markerTone = toneOf(Math.round(current));

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        [side]: 96,
        padding: "24px 30px 24px",
        borderRadius: 14,
        background: theme.panel,
        border: `2px solid ${theme.panelBorder}`,
        opacity: appear,
        transform: `translateX(${slide}px)`,
        fontFamily: theme.mono,
        fontWeight: 500,
      }}
    >
      {title ? <div style={{ fontSize: 27, color: theme.text, marginBottom: 20 }}>{title}</div> : null}
      <div style={{ display: "flex", alignItems: "center" }}>
        {states.map((state, index) => {
          // How lit this state is: 1 with the marker on it, fading as the marker leaves.
          const lit = clamp(1 - Math.abs(current - index));
          const visited = clamp(current - index);
          const reached = clamp(current - index + 1);
          const tone = toneOf(index);
          return (
            <div key={`${state.name} ${index}`} style={{ display: "flex", alignItems: "center" }}>
              {index > 0 ? <Arrow /> : null}
              <div
                style={{
                  width: CELL,
                  boxSizing: "border-box",
                  padding: "16px 10px",
                  borderRadius: 10,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  fontSize: 25,
                  border: `3px solid color-mix(in srgb, ${tone} ${100 * lit}%, ${theme.panelBorder})`,
                  background: `color-mix(in srgb, ${tone} ${Math.max(10 * visited, 14 * lit)}%, transparent)`,
                  color: `color-mix(in srgb, ${tone} ${100 * Math.max(lit, state.tone === "danger" ? 1 : 0)}%, ${theme.text})`,
                  opacity: 0.45 + 0.55 * reached,
                }}
              >
                {state.name}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", height: MARKER + 10, marginTop: 8 }}>
        <svg
          width={MARKER * 2}
          height={MARKER}
          viewBox={`0 0 ${MARKER * 2} ${MARKER}`}
          style={{ position: "absolute", top: 4, left: current * (CELL + GAP) + CELL / 2 - MARKER }}
        >
          <path d={`M${MARKER} 0 L${MARKER * 2} ${MARKER} L0 ${MARKER} Z`} fill={markerTone} />
        </svg>
      </div>
    </div>
  );
};
