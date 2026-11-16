import type { StoryboardProps } from "../../kit";
import { bugLowStockMeta, timeline as t } from "./BugLowStock";

/** The low stock bug as one sheet to present from. `pnpm storyboard BugLowStockBoard`. */
export const bugLowStockBoard: StoryboardProps = {
  video: bugLowStockMeta.id,
  panels: [
    { frame: t.at("writes", "reserves") - 6, note: "One order makes the save write the row twice. For a moment the stock reads zero." },
    { frame: t.at("first", "passes") + 4, note: "The trigger checks each write on its own, so the zero passes and an alert goes out." },
    { frame: t.at("fix", "ended"), note: "The fix checks the save once: the value it started with against the value it ended with." },
    { frame: t.at("quiet", "crosses") + 4, note: "Replayed, 120 to 110 never crosses the minimum, so the same order sends nothing." },
  ],
};
