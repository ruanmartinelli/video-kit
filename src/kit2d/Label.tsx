import type { z } from "zod";
import { labelSchema } from "../kit/schemas";
import { theme } from "../kit/theme";
import { useCamera } from "./World";

type LabelProps = z.input<typeof labelSchema>;

/** Short text in the world, placed by its bottom center. */
export const Label = (props: LabelProps) => {
  const { position, children, size, opacity } = labelSchema.parse(props);
  const camera = useCamera();
  const [x, y] = camera.point(position);

  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={theme.sans} fontWeight={600} fontSize={size * camera.scale} fill={theme.text} opacity={opacity}>
      {children}
    </text>
  );
};
