import type { Video } from "../../kit";
import { AuthCheck, authCheckMeta, timeline } from "./AuthCheck";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: AuthCheck, meta: authCheckMeta, timeline };
