import type { Video } from "../../kit";
import { PrGraphql, prGraphqlMeta, timeline } from "./PrGraphql";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: PrGraphql, meta: prGraphqlMeta, timeline };
