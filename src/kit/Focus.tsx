import { createContext, useContext, type ReactNode } from "react";
import { z } from "zod";
import { unitSchema } from "./motion";

export const focusSchema = z.object({
  on: z.array(z.string()).describe("Ids of the actors to keep lit. Everything else with an id dims."),
  amount: unitSchema.default(1).describe("0 = no dimming, 1 = fully dimmed. Drive it from the frame."),
});

type FocusProps = z.input<typeof focusSchema> & { children: ReactNode };

const FocusContext = createContext<z.output<typeof focusSchema> | null>(null);

/** Dims every actor inside it except the ones named in `on`. Wrap the actors, not the camera. */
export const Focus = ({ children, ...props }: FocusProps) => (
  <FocusContext.Provider value={focusSchema.parse(props)}>{children}</FocusContext.Provider>
);

/** How dimmed the actor with this id should be: 0 = normal, 1 = fully dimmed. */
export const useDim = (id: string | undefined) => {
  const focus = useContext(FocusContext);
  if (!focus || (id !== undefined && focus.on.includes(id))) {
    return 0;
  }
  return focus.amount;
};
