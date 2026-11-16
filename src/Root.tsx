import { Composition } from "remotion";
import { reviewBeats } from "./gallery/ReviewBeats";
import { ShapeGallery, shapeGalleryMeta } from "./gallery/ShapeGallery";
import { PrApiKeys, prApiKeysMeta } from "./videos/pr-api-keys/PrApiKeys";
import { PrAuth, prAuthMeta } from "./videos/pr-auth/PrAuth";
import { LoadBalancer, loadBalancerMeta } from "./videos/load-balancer/LoadBalancer";

export const Root = () => (
  <>
    <Composition component={LoadBalancer} {...loadBalancerMeta} />
    <Composition component={PrApiKeys} {...prApiKeysMeta} />
    <Composition component={PrAuth} {...prAuthMeta} />
    <Composition component={ShapeGallery} {...shapeGalleryMeta} />
    {reviewBeats.map(({ id, component }) => (
      <Composition key={id} id={id} component={component} fps={30} width={1920} height={1080} durationInFrames={2} />
    ))}
  </>
);
