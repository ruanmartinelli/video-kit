import type { Video } from "../../kit";
import { PrShared, prSharedMeta, timeline } from "./PrShared";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: PrShared, meta: prSharedMeta, timeline };
