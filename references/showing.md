# Which piece draws what

A lookup, from what a beat is about to the piece that draws it. `pieces/<id>.md` has each piece's props.

## Any explainer

- **A rule that lets some things through** (a trigger condition, a filter, a guard): a `Gate` on the pipe, with the rule as its text. Send each case to `gatePoint()`, then on through in `accent` or back in `danger`, and pulse the gate in the same tone.
- **A record changing state**: `Lifecycle` for the state it is in, `RecordCard` for the field that changed (flip it on the frame the write lands), a `badge` on the node that holds it (`locked`, `syncing`, `failed`, `done`).
- **A number against a limit** (stock and its minimum, a transaction and its time cap): `Meter`, with `value` driven from the frame.
- **What happened to one thing over a day**: `EventTimeline`. `Schedule` when the events are a fixed interval.
- **One becomes many, or many become one** (fan-out, batching, dedupe): `Fan`.
- **Old and new at the same time**: `layoutLanes(graph)` gives one copy of the graph per lane. Send the same packet down both on the same frame. Use lanes when the paths differ; when only the answer differs, run it twice with `Outcomes`.
- **A rollout**: `Phases`, with `current` moving on as each step is spoken.
- **A size or a share**: `Bars` for two to six values to scale, `Proportion` for a part of a whole.
- **Someone asking an assistant**: `Chat`. The assistant is an `agent` node and the model it calls is a `model` node.
- **A word the viewer may not know**: `Term`, on screen while the thing it names is.
- **The one thing in the shot to look at**: `Callout`. One per shot.
- **A line of code that changed**: `CodePanel` with `removed` and `added`, the old line above the new one.
- **The app's own screen**: `Screenshot`, with `highlight` on what the narration names and `wipe` from the old screen to the new.
- **A video over three minutes**: `Chapter`, with a title card at each chapter start.

## A change to code (a pull request, a migration)

- **What this change touched**: `change` (`added`, `changed`, `removed`) on every node, table and column it touched, and on nothing else. Color then means "this change".
- **The file a hop's code lives in**: a `Chip` naming it, so the viewer can check it against the diff.
- **The list of what the video covers**: `Manifest`, with a `footer` for what it leaves out.
- **A schema**: `Tables` in `overlay`, with the database node beside it in the world. Columns enter with `appear`. A GraphQL type is a panel too, named `type Mutation`, with `change: "added"` on each new field.
- **A query**: a packet from the service to the database. The row it reads or writes pulses its `lit` on the frame the packet lands.
- **An answer that changed** (an auth check, a policy, tenant scoping): each case is a `Packet` with a `label`, sent through the changed node once per version. A case that passes travels on; a case that is refused travels back to where it came from. `Outcomes` in `overlay` keeps score: fill a row's `before` or `after` on the frame its packet reaches the node. A `Chip` says which version is on screen.
- **One input, its old and new result**: `Outcomes` with `heading="input"`.
- **A helper and everything that calls it**: `layoutHub`, the helper in the middle and every caller around it, `change: "changed"` on the callers the change updated. A `Ripple` leaves the helper and each caller lights as the front reaches it, in `danger` for the ones left behind.
- **A route**: the `label` on a pipe that leaves the router, set through `Graph3D`'s `edges`. A new one is `tone: "added"`, to a controller with `change: "added"`. Whatever the existing routes pass on the way (auth, rate limiting) is a node in the graph, so a route that skips it shows as a pipe that goes around.
- **A resolver**: a `file` node between the GraphQL server and the database. A `Chip` in the top-right corner counts the database packets one query causes.
- **A job**: a `worker` node, with everything that starts it: the `queue` it reads from, a `clock` for a schedule. A changed interval is two rows in `Schedule`, old and new, over the same window.
