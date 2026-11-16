import { Composition } from "remotion";
import { ActorGallery, actorGalleryMeta } from "./gallery/ActorGallery";
import { OverlayGallery, overlayGalleryMeta } from "./gallery/OverlayGallery";
import { PanelGallery, panelGalleryMeta } from "./gallery/PanelGallery";
import { ShapeGallery, shapeGalleryMeta } from "./gallery/ShapeGallery";
import { PrApiKeys, prApiKeysMeta } from "./videos/pr-api-keys/PrApiKeys";
import { PrAuth, prAuthMeta } from "./videos/pr-auth/PrAuth";
import { PrCron, prCronMeta } from "./videos/pr-cron/PrCron";
import { PrEndpoint, prEndpointMeta } from "./videos/pr-endpoint/PrEndpoint";
import { PrGraphql, prGraphqlMeta } from "./videos/pr-graphql/PrGraphql";
import { PrShared, prSharedMeta } from "./videos/pr-shared/PrShared";
import { LoadBalancer, loadBalancerMeta } from "./videos/load-balancer/LoadBalancer";

export const Root = () => (
  <>
    <Composition component={LoadBalancer} {...loadBalancerMeta} />
    <Composition component={PrApiKeys} {...prApiKeysMeta} />
    <Composition component={PrAuth} {...prAuthMeta} />
    <Composition component={PrShared} {...prSharedMeta} />
    <Composition component={PrEndpoint} {...prEndpointMeta} />
    <Composition component={PrGraphql} {...prGraphqlMeta} />
    <Composition component={PrCron} {...prCronMeta} />
    <Composition component={ShapeGallery} {...shapeGalleryMeta} />
    <Composition component={ActorGallery} {...actorGalleryMeta} />
    <Composition component={PanelGallery} {...panelGalleryMeta} />
    <Composition component={OverlayGallery} {...overlayGalleryMeta} />
  </>
);
