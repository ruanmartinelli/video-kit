# CameraRig

The camera is the narrator. Give each shot the points to keep in frame and an angle; the rig works out where to stand and eases between shots. When a docked panel is on screen, name its side in `panel` and the rig fits the targets into the rest of the frame. Give it the `graph` and it refuses a shot where two node labels overlap.

## CameraRig

- `shots` ({ at: number; targets: Vec3[]; view: "wide" | "close" | "low" | "top"; azimuth: number; elevation: number; padding: number; panel: "left" | "right"; shift: [number, number]; allow: string[] })[], required. Ordered by `at`. The first shot is where the camera starts.
- `moveFrames` number = 45. Frames each move between shots takes.
- `sway` number = 3. Degrees of slow side-to-side drift. 0 locks the camera off.

## Shot

- `at` number, required. Frame at which the camera starts moving to this shot.
- `targets` Vec3[], required. Points to keep in frame. The camera fits all of them.
- `view` "wide" | "close" | "low" | "top" = "wide". Named angle.
- `azimuth` number = 0. Degrees around the targets. 0 is front-on, positive swings right.
- `elevation` number. Degrees above the floor. Overrides the view's.
- `padding` number. Zoom. 1 is tight, 2 is twice as far. Overrides the view's.
- `panel` "left" | "right". The side a docked panel (CodePanel, Outcomes, Tables, Meter, ...) is on during this shot. The rig fits the targets into the rest of the frame.
- `shift` [number, number]. Slide the subject on screen, as a fraction of the frame: [right, up]. Defaults to a little above center, or clear of `panel` when that is set.
- `allow` string[] = []. Ids of nodes left out of the label check: ones that are not in the scene during this shot. Only read when the rig is given a `graph`.

## Also

- `graph` Graph | Graph[]. The graph on stage. With it the rig checks every shot once the camera has settled: two node labels overlapping throws, and the error says what to change.

## Example

```tsx
<CameraRig
  graph={graph}
  shots={[
    { at: 0, targets: everything },
    { at: t.at("inside"), targets: [graph.position("lb")], view: "close", azimuth: 12 },
    // A CodePanel is on the right from here: the rig keeps the balancer clear of it.
    { at: t.at("code"), targets: [graph.position("lb")], view: "close", panel: "right" },
  ]}
/>
```
