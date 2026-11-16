import type { Video } from "../../kit";
import { LoadBalancer, loadBalancerMeta, timeline } from "./LoadBalancer";
import { loadBalancerBoard } from "./board";

/** What `src/Root.tsx` registers. Every folder under `src/videos/` that has this file is picked up. */
export const video: Video = { component: LoadBalancer, meta: loadBalancerMeta, timeline, board: loadBalancerBoard };
