import type { Video } from "../../kit";
import { NewEndpoint, newEndpointMeta, timeline } from "./NewEndpoint";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: NewEndpoint, meta: newEndpointMeta, timeline };
