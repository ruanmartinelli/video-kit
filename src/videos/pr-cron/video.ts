import type { Video } from "../../kit";
import { PrCron, prCronMeta, timeline } from "./PrCron";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: PrCron, meta: prCronMeta, timeline };
