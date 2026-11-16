import type { Video } from "../../kit";
import { SharedHelper, sharedHelperMeta, timeline } from "./SharedHelper";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: SharedHelper, meta: sharedHelperMeta, timeline };
