# Structures that worked

Read this when the request points you here. Each is one way a video of that kind held together: take one, bend it, or build your own.

## Any explainer

One question, answered by following one concrete example through the system. It opens on the problem: what the user saw, or what breaks without the thing being explained. It ends on what the solution costs.

## A bug and its fix

Open on what the user saw. Follow the one record that went wrong to the line that explains it. Replay the same record with the fix, then show a case that must still work. End on what the fix costs.

## A pull request, for its reviewer

Show what the reviewer has to look at and leave the rest of the diff out.

- **Opening.** One item: the problem it solves. More than one: the list of items, changed behaviour before new surface, then the problem.
- **Middle.** One section per item, in the list's order, each as long as its risk deserves.
- **Ending.** The single thing the reviewer should check, with the lines of code that decide it. What the change costs gets a beat when the cost is that thing.

A section, by what the item is:

- **Schema and data flow.** Schema first, one beat per migration. Then one request, followed from the client to the table rows it reads and writes.
- **Changed behaviour** (code that now answers differently). Show the answers, since the diff alone does not. Five cases or fewer: each role, each tenant, each kind of input, one of them the case whose answer changed. Every case runs as the base branch answers, then as the pull request answers. The changed case goes last and is followed all the way to what it now reaches. End on the lines of code that explain it.
- **Shared code** (a helper with callers the pull request left alone). First what changed: one input, its old and new result. Then who gets it: every caller, the untouched ones lighting up. End on the untouched caller where the new result does the most damage.
- **A new endpoint.** One request, followed down the new route to what it reads or writes.
- **GraphQL.** One query, followed so the viewer can count the database queries it causes.
- **Jobs and schedules.** A new worker, a new schedule entry, a changed interval. A changed body in an existing worker is ordinary code and stays out.
