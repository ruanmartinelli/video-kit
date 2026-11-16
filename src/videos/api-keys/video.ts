import type { Video } from "../../kit";
import { ApiKeys, apiKeysMeta, timeline } from "./ApiKeys";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: ApiKeys, meta: apiKeysMeta, timeline };
