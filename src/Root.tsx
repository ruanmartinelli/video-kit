import { Composition } from "remotion";
import { ShapeGallery, shapeGalleryMeta } from "./gallery/ShapeGallery";
import { LoadBalancer, loadBalancerMeta } from "./videos/load-balancer/LoadBalancer";

export const Root = () => (
  <>
    <Composition component={LoadBalancer} {...loadBalancerMeta} />
    <Composition component={ShapeGallery} {...shapeGalleryMeta} />
  </>
);
