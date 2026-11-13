# The shape

What the factory is built from, and what it needs the engine to be. One page on purpose. A stage, a slice of engine work or an agent's brief starts from here.

An **operator** is whoever uses Archon: a person, or far more often that person's agent. Where this page says operator it means either.

## Primitives

| Primitive | What it is |
|---|---|
| **Item** | The durable thing work is about. A small row in the engine: key, project, created. |
| **Stage** | A kind of work on an item, defined once: triage, deliver, land. A workflow. |
| **Run** | One attempt of a stage on one item. Thrown away after. |
| **Outcome** | The typed end of a run, declared by its stage and checked by the engine. |
| **Ask** | A decision that belongs to an item: context, options with what each costs, a recommendation, links to artifacts. |
| **Link** | A relation between two items: depends on, same as, part of. Held by the engine, so it can hold an item back until what it depends on has landed. |
| **Seam** | A typed operation to something outside: tracker, change host, checks, identity. |
| **Capacity** | How many runs at once, per resource. |

An item has many runs. A run is one attempt of one stage and ends in exactly one outcome. An item has zero or more asks. Seams belong to the project. Capacity belongs to a resource. Links connect items into a graph, and an item is ready when its last outcome is build and nothing it depends on is still open.

## The one rule

Something happens to an item, and the engine starts a stage. Three things can happen:

1. An item arrives from a source.
2. A run ends with an outcome.
3. The asks a run left are all answered.

A binding in the pack says which stage each event starts. The engine reads it when the event happens.

## What the item owns and what the run owns

If this run died now, what must the next run know? That is the item's. What should be fresh for every attempt? That is the run's.

- **Item:** identity, a reference to the contract where it was written, rulings, open asks, approvals and the head each was given at, the size budget, the model setup, the change and its head.
- **Run:** the checkout, the agent session, the workflow source it started on, its capacity slot, evidence at a head, time and tokens spent.

Where an item stands is never stored. It is its last outcome plus its open asks. Evidence stays on the run and is looked up by item and head.

## Who holds the state

The factory holds what the factory derived. The tracker holds what its authors wrote. An author can be an operator or anyone else who files there, and is as likely an agent as a person. There is never a two-way sync.

| Fact | Written by | Lives in | The other side |
|---|---|---|---|
| The item's text and its discussion | The tracker's authors | Tracker | The engine keeps a reference and a version |
| Priority, cycle, a relation someone set | The tracker's authors | Tracker | The engine reads it as input |
| Bucket, size, proposed links | The factory | Engine | Shown in the tracker as a label, a comment or a native relation |
| Asks, answers, run history | The factory and the operator | Engine | A ruling is written back so it can be seen |

- The factory acts only on items it has admitted. Before intake, an item is just a thing in someone's tracker.
- Tracker to factory: an edit changes the item's version, so judging or linking runs again and the graph is derived again.
- Factory to tracker: the engine writes its outcome back through the tracker seam.
- A proposed link that is accepted is a ruling. It is written to the tracker as its author's, and from then on it is input like any other.
- The engine's graph is the one delivery waits on. Because the engine owns it, any surface can draw it.

## Asks

- A run leaves asks as part of its outcome. The engine validates them and opens them in the same write that completes the run.
- A failed run has no outcome, so it opens no asks. It shows as a failure to look at.
- An ask can be withdrawn. A new set from the same stage for the same item replaces the old one.
- An operator who may act on the item's project may answer. When the operator is an agent, the answer records the run that gave it.
- When the whole set is answered, the engine starts the stage that asked, with the answers as input. The answer and that start are one write.
- Later, on the same primitive: the pack may declare a shortcut from one option straight to another stage; a run may wait for an answer mid-run; a run may ask and keep going on its own recommendation. An agent never names a route at run time.

## Seams

"The forge" is four roles. The factory is written against the roles, with no forge at all as the base case.

| Role | Needs | No forge | GitHub |
|---|---|---|---|
| Tracker | List changed items, read one, write an outcome back, close | Item files | Issues |
| Change host | Propose a change from a branch, read its head, land pinned to it | Local git | Pull requests |
| Checks | Is this tree proven | A declared command | CI checks |
| Identity | Who may decide what | The local user | Maintainers |

No stage prompt names a forge.

## Build rules

- Prompts first, in command files only. A goal and the outcomes, with as little steering as measurement allows.
- A script only where a measured failure asked for one. TypeScript.
- No tests of the pack's own scripts. Real items are the measure.
- A stage does not ask mid-run. It finishes and leaves its asks.
- Not "is the engine working" but "is the engine working right". A workaround in the pack is an engine finding, and it stays out of the pack.

## What the engine lacks today

Attention, its watch, its events and the permission to answer are keyed on a run, and cleanup of finished runs erases an item's history. The engine work, in slices that are each correct alone:

1. The item: a row, and its key on every run and start.
2. Attention keyed on the item, with today's mid-run pause rebuilt on top.
3. A typed outcome on a workflow, with asks as part of it; the last answer starts a stage.
4. A binding that fires on a run's outcome.
5. Retention by item.
