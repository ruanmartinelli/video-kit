# Reviewing a PR

A review video shows what the reviewer has to look at and leaves the rest of the diff out. Each kind of change below has a reference video: copy the one that matches.

**How it opens.** A PR with one item opens on the problem it solves. A PR with more than one opens on a `Manifest`, then the problem.

**How it ends.** On the single thing the reviewer should check, with the lines of code that decide it. What the change costs gets a beat only when the cost is that thing.

- Set `change` (`added`, `changed`, `removed`) on every node, table and column the PR touched, and on nothing else: color means this PR.
- Name the file on screen with a `Chip` for every hop whose code the narration talks about, so the viewer can check it against the diff.
- A wide shot of the whole path wants the frame as much as a panel does: show one or the other.
- The `Manifest`, with `title="What to look at in this PR"`, lists every item the video covers, changed behaviour before new surface, with a `footer` for what it leaves out. Then one section per item, in that order, each as long as its risk deserves.
- Any piece in `explaining.md` serves a review too: a `Gate` for a condition the PR adds, `layoutLanes` for an old path kept beside a new one.

## Schema and data flow

`src/videos/api-keys/`. Schema first, then one request followed from the client to the table rows it reads and writes.

- Tables are flat: `Tables` in `overlay`, with the database node beside it in the world. One beat per migration, with a `Chip` naming its file. Columns enter with `appear`.
- A query is a packet from the service to the database. The row it reads or writes pulses its `lit` on the frame the packet lands.

## Changed behaviour

`src/videos/auth-check/`. When a PR changes what existing code answers (an auth check, a policy, tenant scoping), show the answers, since the diff alone does not.

- Pick the cases that matter: each role, each tenant, each kind of input. Five or fewer, and one of them is the case whose answer changed.
- Send every case through the changed node twice, as a `Packet` with a `label`: once as the base branch answers, once as the PR answers. A case that passes travels on; a case that is refused travels back to where it came from.
- `Outcomes` in `overlay` keeps score. Fill a row's `before` or `after` on the frame its packet reaches the node.
- A `Chip` says which run is on screen: `before this PR`, `with this PR`.
- The case whose answer changed goes last, in `danger`, and is followed all the way to what it now reaches. End on the lines of code that explain it.

## Shared code

`src/videos/shared-helper/`. A helper whose existing behaviour changed, with callers the PR did not touch.

- First what changed: one input and its old and new result, in `Outcomes` with `heading="input"`.
- Then who gets it: `layoutHub` with the helper in the middle and every caller around it. `change: "changed"` on the callers the PR updated, nothing on the rest.
- A `Ripple` leaves the helper. Each caller outside the PR lights in `danger` as the front reaches it.
- End on the outside caller where the new result does the most damage.

## New endpoint

`src/videos/new-endpoint/`.

- A route is the `label` on a pipe that leaves the router, set through `Graph3D`'s `edges`. The new one is `tone: "added"`, to a controller with `change: "added"`.
- Whatever the existing routes pass on the way (auth, rate limiting) is a node in the graph, so a new route that skips it shows as a pipe that goes around.
- Follow one request down the new route to what it reads or writes.

## GraphQL

`src/videos/graphql-field/`.

- The schema is `Tables` in `overlay`: one panel per type, named `type Mutation`, with `change: "added"` on each new field.
- A resolver is a `file` node between the GraphQL server and the database. Follow one query and let the viewer count the database packets it causes; a `Chip` in the top-right corner keeps the total.

## Jobs and schedules

`src/videos/job-schedule/`. A new worker, a new schedule entry, or a schedule whose interval changed. A changed body in an existing worker is ordinary code: leave it out.

- A job is a `worker` node. Draw everything that starts it: the `queue` it reads from, a `clock` for a schedule.
- A changed interval is two rows in `Schedule`, old and new, over the same window.
