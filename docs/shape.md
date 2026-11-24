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

This split is what we believe today (last changed 2026-11-16) and moves when runs teach us otherwise.

If this run died now, what must the next run know? That is the item's. What should be fresh for every attempt? That is the run's.

- **Item:** identity, a reference to the contract where it was written, rulings, open asks, approvals and the head each was given at, the size budget, the model setup, the change and its head, and (hypothesis, see the bet below) the agent session of each role that works it.
- **Run:** the checkout, the transcript of the attempt, the workflow source it started on, its capacity slot, evidence at a head, time and tokens spent.

Where an item stands is never stored. It is its last outcome plus its open asks. Evidence stays on the run and is looked up by item and head.

### Resume

> **Hypothesis, not a decision.** Shaping from 2026-11-15, after the first deliver trial was interrupted and Archon issue 5699 was filed.

The run is what is resumed. The item is what an operator names.

- **Resume repairs one execution.** Its completed nodes, its workflow source, its session and its checkout are the run's, so only a run can be resumed. An item never has a resumable state of its own.
- **An operator says "carry on with this item".** The engine resolves that: an interrupted run on the item is resumed, and otherwise what follows is a new run on the item. Naming a run id stays the exact form.
- **The engine does not choose between runs.** When an item has more than one interrupted run, resuming by item refuses and lists them.

**Bet (Rasmus, 2026-11-15): an agent's session belongs to the item.** The builder's for certain, the planner's and each reviewer's very likely. One session per item and role, so a role picks up what it already knows about the item whichever run it is in. Not measured; a bet.

What it rests on and what would test it:

- The engine already keeps sessions across runs: `persist_session` keys them by workflow, node, scope and provider, and the scope is the chat a run was started from. A run started from the CLI has no scope, so today these sessions never apply to the factory. Making the item a scope is an addition to that key, not a new mechanism.
- Measured so far (three cases, one reviewer model): a second review in the same context and a fresh one that is told what was returned both beat a fresh one that is told nothing. Same context versus told is not separated yet.
- Open risks: a reviewer that keeps its session may defend its earlier findings; a long item grows a long session; a session is tied to one provider and model, so an item whose model changes between rounds (Archon issue 5592) cannot carry it; two runs of one role on one item must not write to one session.
- First test: a check or review result that arrives after the deliver run ended. Fix it once in the builder's item session and once in a fresh session that is told, on the same cases, and compare the fix and the cost.


**The workflow author chooses fresh or same (Rasmus, 2026-11-15, hypothesis).** For work on an item, a node either starts fresh or continues in the same context it had the last time it worked this item. That is the whole choice, and the author makes it per node; the engine does not decide it.

- Fresh is the default, as today.
- Same means the session this node last had on this item, in whichever run that was. On the item's first run there is none, so it starts fresh.
- The factory pack's own choices (builder same; planner and reviewers likely same) are the pack's policy, to be measured.

Not in this: one session shared by differently named nodes or by two workflows, such as a build workflow and a merge workflow continuing one builder. Add a way to name the session only when a real case needs it.

## Work orders

> **Hypothesis, not a decision.** Everything in this section, including turning everything on and the landing branch, is shaping from 2026-11-13. Nothing here is ruled, and nothing is built on it until it has been tried on real items.

A work order is a planned group of items: a release, a batch, a backlog switched on. It is an item, not a new primitive.

**Ruled 2026-11-24 and built:** a work order of several items is an item whose members are `part_of` it. One order names the members, the order stage records the links, and each member is ordered like any other item. A member that records no landing branch takes the work order's. The README says how to fire one. The rest of this section is still hypothesis.

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

> **Hypothesis, not a decision.** The direction we lean to, from 2026-11-13. It rests on one measurement of nine items and fixes a permanent table, so nothing is built on it until the link stage is measured again with this shape. The pack's link stage already uses its wording (an overlap, proposals only) and is unmeasured in that form.

Three kinds, each stored with a direction. Only accepted links are stored.

| Kind | Direction | Who acts on it |
|---|---|---|
| `depends_on` | from the item that waits, to the item it waits for | The engine: an item is ready when what it depends on has landed |
| `part_of` | from the piece, to the whole | Ranking and the graph |
| `duplicate_of` | from the item that goes away, to the one that stays | The pack closes or folds the first |

- The link stage proposes, and a proposal is an ask. The answer writes the link. For two items that overlap, the stage says so and asks which one stays; it does not pick.
- Measured on nine items and six models: five found the real duplicate pair and all five read its direction the other way from the maintainer; two models added dependencies that were not real. A wrong `depends_on` stops an item from starting, so the engine never waits on a guess.
- A link that stops being true is ended by a second fact, not deleted.

**Ruled 2026-11-24 and built:** linking is the link agent's job. The link stage runs after triage as a stage of its own, decides whether the item can be built now, and records the links itself with `archon workflow link`; no operator links by hand and no script turns a proposal into a link. An item waits only on a blocking dependency: on another member of its work order, or on what its order states, which is taken as given. On an item outside its work order it does not wait and says what it would have waited on (a shadow, until that has been compared with what happened). When what an item waits on ends, the link stage runs again on it: landed, it goes on; ended without landing, it gets an ask.
- Cost: more asks, about one for every three items at first. To be measured, together with how many repeat an answer already given.

## Discoveries

> **Hypothesis, not a decision.** From 2026-11-15. Nothing is built on it yet.

While it works, an agent sees things outside its scope: something odd, a question, dead code, a wrong comment. Reporting one must be cheap, and the factory picks it up.

- **Reporting.** A stage's result carries what it noticed: what, where, and why it looked off. The agent does not verify it, fix it or chase it.
- **Internal tracking.** A discovery stays in the factory. It is not an issue and not an item, and nobody outside sees it yet.
- **A periodic drain.** A scheduled stage reads the whole list at once, as a principled engineering manager would: it judges the entries against the project's policy and decides what gets filed. What it files becomes an item like any other. The rest is dropped or held, with the reason.

A real defect counts highest. The drain ranks what it files, and a defect in behaviour that matters goes ahead of everything else on the list: dead code, a wrong comment and a question come after it.

The drain is a taste-driven outer loop. Its policy is where the project's taste is written: its direction and what its maintainers hold code to. Carrying that taste into what gets filed is what the policy is for.

Reading the list at once is the point. Ten agents noticing the same thing is one entry with a count, and a pattern across entries is visible in a way it never is one at a time.

What the old pack shows: its discoveries filed 429 issues on Archon and 296 were closed by a merged change, with a median change of about 390 lines. The source is strong. The cost came from building nearly all of it, each one filed and worked without this judgment.

Open:

- Where the list lives. It is derived from run results (reported, minus what a drain already decided). That needs the reader slice 4 adds, of results across runs. A pack that keeps a state document for it is an engine finding.
- What the drain may do without an operator: file, fold into an existing item, drop. Whether filing is an ask.
- How often it runs, and what it costs when the list is long.

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

The earlier queue PRD (Archon issue 5561, closed 2026-11-15) put the queue first and stored an item's state. Its measurements still stand as evidence: the 2026-11-12 dogfood numbers and the count of hand-off code in the old pack.

Until slice 4 exists, two stages run in one parent run only where they belong to the same moment for the same item, as judging and linking do. A hand-off between stages with different capacity waits for slice 4; a node that fires the next stage itself is the workaround this factory does not use.

## Where a stage's inputs come from

| Kind | Source |
|---|---|
| The item | The event that started the stage. A binding maps event fields into the stage's declared inputs. |
| An earlier stage's result | Inside one parent run, passed from one stage to the next. Across runs, the item event binding of slice 4. |
| The project's policy | A pack setting holds the path to the project's policy file. The pack ships a default. The prompt tells the agent to read both, and the project's wins. No script loads either. |
