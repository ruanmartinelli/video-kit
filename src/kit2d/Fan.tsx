import type { z } from "zod";
import { span } from "../kit/geometry";
import { lerp3 } from "../kit/motion";
import { fanSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { CLEAR } from "./Pipe";
import { useCamera } from "./World";

type FanProps = z.input<typeof fanSchema>;

const ARC = 0.45;
const RADIUS = 0.14;

/** One thing becomes many, or many collapse into one: one small packet per target, on a single progress. */
export const Fan = (props: FanProps) => {
  const { from, to, direction, progress, tone, stagger, clear } = fanSchema.parse(props);
  const camera = useCamera();

  if (progress <= 0 || progress >= 1) {
    return null;
  }

  const last = to.length - 1;
  // Each trip lasts `window` of the whole; the starts spread over the rest.
  const window = 1 - stagger * (last / (last + 1));
  const color = tone === "neutral" ? theme.neutral : theme[tone];

  return (
    <>
      {to.map((target, index) => {
        const local = (progress - (index / last) * (1 - window)) / window;
        if (local <= 0 || local >= 1) {
          return null;
        }
        const [one, many] = span(from, target, clear ?? [CLEAR, CLEAR]);
        const [start, end] = direction === "split" ? [one, many] : [many, one];
        const [x, y] = camera.point(lerp3(start, end, local));
        return <circle key={index} cx={x} cy={y - Math.sin(Math.PI * local) * ARC * camera.scale} r={RADIUS * camera.scale} fill={color} />;
      })}
    </>
  );
};
