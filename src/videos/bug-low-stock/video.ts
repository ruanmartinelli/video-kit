import type { Video } from "../../kit";
import { BugLowStock, bugLowStockMeta, timeline } from "./BugLowStock";
import { bugLowStockBoard } from "./board";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: BugLowStock, meta: bugLowStockMeta, timeline, board: bugLowStockBoard };
