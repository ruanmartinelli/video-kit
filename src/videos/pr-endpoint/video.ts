import type { Video } from "../../kit";
import { PrEndpoint, prEndpointMeta, timeline } from "./PrEndpoint";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: PrEndpoint, meta: prEndpointMeta, timeline };
