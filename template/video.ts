import type { Video } from "video-kit";
import { Template, templateMeta, timeline } from "./Template";

/** What the scripts render: the component, its size and length, and the timeline its cue frames come from. */
export const video: Video = { component: Template, meta: templateMeta, timeline };
