import type { Video } from "../../kit";
import { PrAuth, prAuthMeta, timeline } from "./PrAuth";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: PrAuth, meta: prAuthMeta, timeline };
