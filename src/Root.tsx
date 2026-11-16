import { Composition } from "remotion";
import { LoadBalancer, loadBalancerMeta } from "./videos/load-balancer/LoadBalancer";

export const Root = () => <Composition component={LoadBalancer} {...loadBalancerMeta} />;
