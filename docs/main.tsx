import { Player } from "@remotion/player";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { tracerMeta } from "../src/videos/tracer/Tracer";
import { demos, type Demo } from "./demos";

const DemoSection = ({ demo }: { demo: Demo }) => (
  <section>
    <h2>{demo.name}</h2>
    <span className="tag">{demo.kind}</span>
    <p>{demo.description}</p>
    <div className="player">
      <Player
        component={demo.component}
        durationInFrames={demo.durationInFrames}
        fps={tracerMeta.fps}
        compositionWidth={tracerMeta.width}
        compositionHeight={tracerMeta.height}
        style={{ width: "100%" }}
        controls
        loop
        autoPlay={demo.kind === "component"}
      />
    </div>
    {demo.code ? <pre>{demo.code}</pre> : null}
  </section>
);

const App = () => (
  <main>
    <h1>video-kit</h1>
    <p>Components agents compose into 3D technical explainer videos.</p>
    {demos.map((demo) => (
      <DemoSection key={demo.name} demo={demo} />
    ))}
  </main>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
