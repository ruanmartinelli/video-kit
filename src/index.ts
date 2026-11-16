import { registerRoot } from "remotion";
import { makeRoot } from "./Root";

// The kit on its own: the galleries, for looking at a piece. A video brings its own entry, written by the scripts.
registerRoot(makeRoot([]));
