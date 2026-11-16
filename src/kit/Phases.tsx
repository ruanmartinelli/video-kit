import { z } from "zod";
import { unitSchema } from "./motion";
import { theme } from "./theme";

export const phasesSchema = z.object({
  steps: z.array(z.string()).min(2).max(6).describe("The rollout's steps in order, a word or two each: `shadow`, `compare`, `move one`, `migrate`."),
  current: z
    .number()
    .min(0)
    .describe(
      "Where the rollout is. Steps below it are done and get a check; the step at Math.floor(current) is lit; later steps are dim. `steps.length` means all done. Drive with ease() from one index to the next.",
    ),
  note: z.string().optional().describe("One line under the strip about the step on screen: `the old path keeps running`."),
  appear: unitSchema.default(1).describe("0 = hidden, 1 = fully in. Drive with ease()."),
});

type PhasesProps = z.input<typeof phasesSchema>;

const CELL = 220;
const GAP = 34;
const BADGE = 40;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * A rollout as a strip of steps across the top of the frame: what is done,
 * what is happening now, what comes next. Goes in World's `overlay`.
 */
export const Phases = (props: PhasesProps) => {
  const { steps, current, note, appear } = phasesSchema.parse(props);

  if (appear <= 0) {
    return null;
  }

  const active = Math.floor(current);

  return (
    <div
      style={{
        position: "absolute",
        top: 170,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        opacity: appear,
        transform: `translateY(${(1 - appear) * -24}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "18px 24px",
          borderRadius: 14,
          background: theme.panel,
          border: `2px solid ${theme.panelBorder}`,
          fontFamily: theme.sans,
          fontWeight: 600,
        }}
      >
        {steps.map((step, index) => {
          const done = clamp(current - index);
          // The number holds through the first half of a step, then crossfades into the check as it draws.
          const check = clamp(2 * done - 1);
          const number = 1 - check;
          const lit = index === active ? 1 : 0;
          const later = index > active;
          return (
            <div key={`${step} ${index}`} style={{ display: "flex", alignItems: "center" }}>
              {index > 0 ? <span style={{ width: GAP, height: 3, borderRadius: 2, background: index <= active ? theme.textDim : theme.panelBorder }} /> : null}
              <div
                style={{
                  width: CELL,
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `3px solid ${lit ? theme.accent : "transparent"}`,
                  background: lit ? `color-mix(in srgb, ${theme.accent} 12%, transparent)` : "transparent",
                  opacity: later ? 0.4 : 1,
                }}
              >
                <span style={{ position: "relative", width: BADGE, height: BADGE, flexShrink: 0 }}>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: BADGE / 2,
                      boxSizing: "border-box",
                      border: `3px solid ${lit ? theme.accent : theme.textDim}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: theme.mono,
                      fontWeight: 500,
                      fontSize: 21,
                      color: lit ? theme.accent : theme.textDim,
                      opacity: number,
                    }}
                  >
                    {index + 1}
                  </span>
                  <svg width={BADGE} height={BADGE} viewBox="0 0 40 40" style={{ position: "absolute", inset: 0, opacity: check }}>
                    <circle cx={20} cy={20} r={20} fill={theme.text} />
                    <path
                      d="M11 20.5 L17.5 27 L29.5 14"
                      fill="none"
                      stroke={theme.panel}
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1 - check}
                    />
                  </svg>
                </span>
                <span style={{ fontSize: 26, whiteSpace: "nowrap", color: lit ? theme.accent : theme.text }}>{step}</span>
              </div>
            </div>
          );
        })}
      </div>
      {note ? <div style={{ fontFamily: theme.sans, fontWeight: 600, fontSize: 26, color: theme.textDim }}>{note}</div> : null}
    </div>
  );
};
