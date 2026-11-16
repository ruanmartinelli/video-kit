import "./base";
import { Player, type PlayerRef } from "@remotion/player";
import { StrictMode, useEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { LoadBalancer, loadBalancerMeta, timeline } from "../src/videos/load-balancer/LoadBalancer";
import { OtherPropsTable, SchemaTable } from "./PropsTable";
import { entries, type Control, type Entry } from "./registry";

const { fps, width, height } = loadBalancerMeta;
const GROUPS = ["Stage", "Actors", "Overlay"] as const;

/** Mounts its children only while on screen, so the page never holds more than a few WebGL canvases. */
const OnScreen = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false), {
      rootMargin: "200px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="player">
      {visible ? children : null}
    </div>
  );
};

const ControlInput = ({ control, value, onChange }: { control: Control; value: string | number | undefined; onChange: (value: string | number) => void }) => (
  <label className="control">
    <span>{control.key}</span>
    {control.kind === "select" ? (
      <select value={String(value)} onChange={(event) => onChange(event.target.value)}>
        {control.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    ) : control.kind === "range" ? (
      <>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={Number(value)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output>{String(value)}</output>
      </>
    ) : (
      <input type="text" value={String(value)} onChange={(event) => onChange(event.target.value)} />
    )}
  </label>
);

const Demo = ({ demo }: { demo: NonNullable<Entry["demo"]> }) => {
  const controls = demo.controls ?? [];
  const [values, setValues] = useState(() => Object.fromEntries(controls.map((control) => [control.key, control.initial])));

  return (
    <>
      <OnScreen>
        <Player
          component={demo.component}
          inputProps={values}
          durationInFrames={demo.durationInFrames}
          fps={fps}
          compositionWidth={width}
          compositionHeight={height}
          style={{ width: "100%" }}
          controls
          loop
          autoPlay
        />
      </OnScreen>
      {controls.length > 0 ? (
        <div className="controls">
          {controls.map((control) => (
            <ControlInput
              key={control.key}
              control={control}
              value={values[control.key]}
              onChange={(value) => setValues((current) => ({ ...current, [control.key]: value }))}
            />
          ))}
        </div>
      ) : null}
    </>
  );
};

const EntrySection = ({ entry }: { entry: Entry }) => (
  <section id={entry.id}>
    <span className="tag">{entry.group}</span>
    <h2>{entry.name}</h2>
    <p>{entry.summary}</p>
    {entry.demo ? <Demo demo={entry.demo} /> : null}
    <pre>{entry.code}</pre>
    {entry.schemas?.map(({ title, schema }) => <SchemaTable key={title} title={title} schema={schema} />)}
    {entry.otherProps ? <OtherPropsTable rows={entry.otherProps} /> : null}
  </section>
);

const VideoSection = () => {
  const player = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const current = player.current;
    if (!current) {
      return;
    }
    const onFrame = (event: { detail: { frame: number } }) => setFrame(event.detail.frame);
    current.addEventListener("frameupdate", onFrame);
    return () => current.removeEventListener("frameupdate", onFrame);
  }, []);

  const playing = timeline.beats.findLast((beat) => beat.from <= frame)?.id;

  return (
    <section id="video">
      <span className="tag">Demo video</span>
      <h2>How a load balancer works</h2>
      <p>
        35 seconds, built only from the components below. Every move is keyed to the narration. Click a beat to jump to
        it.
      </p>
      <div className="player">
        <Player
          ref={player}
          component={LoadBalancer}
          durationInFrames={loadBalancerMeta.durationInFrames}
          fps={fps}
          compositionWidth={width}
          compositionHeight={height}
          style={{ width: "100%" }}
          // The Player's pool of 5 shared audio tags runs out as beats mount: each
          // beat is its own <Audio>. 0 turns the pool off, which is Remotion 5's default.
          numberOfSharedAudioTags={0}
          controls
        />
      </div>
      <ol className="beats">
        {timeline.beats.map((beat) => (
          <li key={beat.id}>
            <button className={beat.id === playing ? "playing" : ""} onClick={() => player.current?.seekTo(beat.from)}>
              <code>{beat.id}</code>
              <span>{beat.text}</span>
              <small>
                {beat.from}–{beat.to}
              </small>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
};

const App = () => (
  <div className="layout">
    <nav>
      <strong>video-kit</strong>
      <a href="#video">Demo video</a>
      {GROUPS.map((group) => (
        <div key={group}>
          <h3>{group}</h3>
          {entries
            .filter((entry) => entry.group === group)
            .map((entry) => (
              <a key={entry.id} href={`#${entry.id}`}>
                {entry.name}
              </a>
            ))}
        </div>
      ))}
    </nav>
    <main>
      <header>
        <h1>video-kit</h1>
        <p>
          Components agents compose into narrated 3D explainer videos. One world, a camera that travels through it, and
          actors that move when the narration says so.
        </p>
      </header>
      <VideoSection />
      {entries.map((entry) => (
        <EntrySection key={entry.id} entry={entry} />
      ))}
    </main>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
