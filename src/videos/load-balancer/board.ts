import { storyboardMeta, type StoryboardProps } from "../../kit";
import { loadBalancerMeta, timeline as t } from "./LoadBalancer";

/** The load balancer video as one sheet to present from. `pnpm storyboard LoadBalancerBoard`. */
export const loadBalancerBoard: StoryboardProps = {
  video: loadBalancerMeta.id,
  panels: [
    { frame: t.at("problem", "falls") + 10, note: "One server takes every request. Past its limit, it falls over." },
    { frame: t.at("route", "picks") + 12, note: "With a balancer in front, every request stops there first and is handed to one server." },
    { frame: t.at("roundrobin", "three"), note: "Inside it is a list and a pointer. Each request moves the pointer on by one." },
    { frame: t.at("around") + 40, note: "A server that fails its health check leaves the list, and traffic goes around it." },
  ],
};

export const loadBalancerBoardMeta = storyboardMeta("LoadBalancerBoard", loadBalancerBoard);
