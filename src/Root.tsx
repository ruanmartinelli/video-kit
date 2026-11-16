import { Composition } from "remotion";
import { ShapeGallery, shapeGalleryMeta } from "./gallery/ShapeGallery";
import { PrApiKeys, prApiKeysMeta } from "./videos/pr-api-keys/PrApiKeys";
import { LoadBalancer, loadBalancerMeta } from "./videos/load-balancer/LoadBalancer";

export const Root = () => (
  <>
    <Composition component={LoadBalancer} {...loadBalancerMeta} />
    <Composition component={PrApiKeys} {...prApiKeysMeta} />
    <Composition component={ShapeGallery} {...shapeGalleryMeta} />
  </>
);
