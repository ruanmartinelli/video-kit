import type { Video } from "../../kit";
import { GraphqlField, graphqlFieldMeta, timeline } from "./GraphqlField";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: GraphqlField, meta: graphqlFieldMeta, timeline };
