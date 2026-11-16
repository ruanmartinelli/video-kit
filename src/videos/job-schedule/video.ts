import type { Video } from "../../kit";
import { JobSchedule, jobScheduleMeta, timeline } from "./JobSchedule";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: JobSchedule, meta: jobScheduleMeta, timeline };
