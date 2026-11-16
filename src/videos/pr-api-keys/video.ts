import type { Video } from "../../kit";
import { PrApiKeys, prApiKeysMeta, timeline } from "./PrApiKeys";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: PrApiKeys, meta: prApiKeysMeta, timeline };
