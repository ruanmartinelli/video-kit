import { Composition } from "remotion";
import { Tracer, tracerMeta } from "./videos/tracer/Tracer";

export const Root = () => <Composition component={Tracer} {...tracerMeta} />;
