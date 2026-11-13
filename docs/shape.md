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

## How a pack shapes an item's state

An item's state is not a document. It is what a reader folds from the facts recorded on the item, and a workflow writer shapes it by declaring types, in three places.

| Place | What the writer declares | Status |
|---|---|---|
| What a stage writes | The stage's result type. A plan stage that returns `size` and `plan` has added both to the item. | Exists: `returns:` with an output format |
| What a stage reads | A binding maps the latest result of an earlier stage on the same item, and the item's answered asks, into the stage's inputs. | Slice 4 |
| What comes from outside | A fact no run produced (the tracker closed the item, a change was merged by hand) arrives as an event on the item with a payload, through the same door as "an item arrives". | Slice 4 |

- A fact is written once and never edited. The latest one wins and the history stays.
- No node sets a status or a position, and there is no per-item document a workflow can overwrite. Two writers on one field is where the old pack's state drifted, and a run that dies mid-way would leave it half-updated.
- A pack that reaches for a state document to hold item state is an engine finding.
- To be tested on validate and land: a fact that changes often and that no stage owns, such as the current head of a change while checks come in. If an event per update is too heavy there, this section is wrong and gets reshaped.

## Work orders

A work order is a planned group of items: a release, a batch, a backlog switched on. It is an item, not a new primitive.

- The order depends on its members (`depends_on` from the order to each). When every member has landed the order is ready, and its own stage starts, for example cutting the release.
- Intake starts only members of an active order, top-ranked first, up to what capacity takes. The backlog waits as items, not as queued starts, so the start queue stays short and an answered item waits behind a few runs, not behind the backlog.
- The order has its own asks and its own outcome, like any item.
- Rank is a fact a ranking stage writes on the order. Dependencies between members give part of the order; rank fills in the rest.
- One item sent by hand is an order of one. Automatic intake is a standing order with a rule for what joins it.

### Turning everything on

Automatic intake is an agent that builds a work order and an operator who approves it. One stage reads the open items and returns a proposed order: its members, the links between them, their rank and the target. Its asks are the approval and the few calls it could not make, such as which of two overlapping items stays. When the asks are settled the order is active and intake starts its members.

Nothing new is needed for this: the proposal is a stage result on the order, the approval is an ask, and activation is the event "asks settled". It is the same pattern as a proposed link and a proposed route: an agent proposes, an operator rules, and the ruling becomes a fact.

To be measured: how often an approved order is changed first, and how large an order can be before the approval stops being a real read.

The complexity sits in two places, and neither is measured yet.

| Where | The hard part | Direction, unproven |
|---|---|---|
| At intake | Mapping dependencies across the whole group. Linking item by item compares each against all the others and raises an ask per proposed link, so switching on a backlog floods the operator. | Link the order once: one run sees the whole group and proposes the graph as one set of asks on the order. |
| At outcome | Grouping what the members produce: one branch, a release, a staging or test pass on the combined tree. | Opt-in: a target set on the order, below. Without one, members land on the base branch and there is nothing to group. |

### The landing branch

Every item lands on the project's base branch unless a target is set. Setting a target is a choice, for any item and for any work order.

- **No target set:** an item lands on the base branch. A work order's members each land on the base branch, one by one, and the order only tracks them. This is the default and needs no branch of its own.
- **A target on an item:** that item lands there.
- **A target on a work order:** its members land there together. The order's stages can test or stage that tree, and the order then lands it where the order itself lands: the base branch, or its own target if it sits inside another order with one.

- Intake passes the landing branch to a member in the event that starts it. A member never reads its order.
- No stage assumes a branch. Land takes the landing branch as an input, and the base branch is only the value used when nothing was set.
- With no forge this is local branches and merges.
- Not measured: a target branch that lives for days drifts from the base branch, so landing it can conflict late. Whether it has to follow the base branch while it is open, and who does that, is open. It only arises when a target is chosen.

## Links

Three kinds, each stored with a direction. Only accepted links are stored.

| Kind | Direction | Who acts on it |
|---|---|---|
| `depends_on` | from the item that waits, to the item it waits for | The engine: an item is ready when what it depends on has landed |
| `part_of` | from the piece, to the whole | Ranking and the graph |
| `duplicate_of` | from the item that goes away, to the one that stays | The pack closes or folds the first |

- The link stage proposes, and a proposal is an ask. The answer writes the link. For two items that overlap, the stage says so and asks which one stays; it does not pick.
- Measured on nine items and six models: five found the real duplicate pair and all five read its direction the other way from the maintainer; two models added dependencies that were not real. A wrong `depends_on` stops an item from starting, so the engine never waits on a guess.
- A link that stops being true is ended by a second fact, not deleted.
- Cost: more asks, about one for every three items at first. To be measured, together with how many repeat an answer already given.

## Asks

- A run leaves asks as part of its outcome. The engine validates them and opens them in the same write that completes the run.
- A failed run has no outcome, so it opens no asks. It shows as a failure to look at.
- An ask can be withdrawn. A new set from the same stage for the same item replaces the old one.
- A set is settled when every ask in it is answered or withdrawn. If all were withdrawn, nothing starts.
- Who may answer: for now the rule a run uses today, whoever started the work or an admin. It moves to the item's project when projects have permissions of their own. When the operator is an agent, the answer records the run that gave it.
- When the whole set is answered, the engine starts the stage that asked, with the answers as input. The answer and that start are one write.
- A run that pauses mid-run for an answer is shown as an ask, but it is not stored as one. The run owns its pause, and the attention list reads stored asks and paused runs into one shape, through one reader, answered by one call. Approval gates follow the same way. A run with no item needs none for this.
- Later, on the same primitive: the pack may declare a shortcut from one option straight to another stage; a run may ask and keep going on its own recommendation. An agent never names a route at run time. Later, an agent may propose a route the table lacks, as an ask: it takes effect only once an operator accepts it and it is written into the pack.

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
2. One attention reader and one item shape, in which a run is optional. Today's pause is derived into it, not copied.
3. Asks as part of a run's result. The engine already has a typed result (`returns:` names a node, and that node's output schema is the type). The addition is a reserved `asks` field in it, checked by the engine and opened in the write that completes the run.
4. A binding on an item event. One mechanism for all three events: a run ends with an outcome, a set of asks is settled, an item becomes ready because what it depends on has landed. The binding table in the pack says which stage each event starts, and what each recommended verb leads to.
5. Links between items, and holding an item until what it depends on has landed.
6. Retention by item.

Until slice 4 exists, two stages run in one parent run only where they belong to the same moment for the same item, as judging and linking do. A hand-off between stages with different capacity waits for slice 4; a node that fires the next stage itself is the workaround this factory does not use.

## Where a stage's inputs come from

| Kind | Source |
|---|---|
| The item | The event that started the stage. A binding maps event fields into the stage's declared inputs. |
| An earlier stage's result | Inside one parent run, passed from one stage to the next. Across runs, the item event binding of slice 4. |
| The project's policy | A pack setting holds the path to the project's policy file. The pack ships a default. The prompt tells the agent to read both, and the project's wins. No script loads either. |
