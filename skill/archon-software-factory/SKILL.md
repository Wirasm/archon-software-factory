---
name: archon-software-factory
description: |
  Operate the Archon software factory pack day to day: see where every work item is and
  what waits on the operator, order items (one, several, on their own branch, as parts of
  a larger item, or by label), answer the asks stages leave, read the factory report on a
  pull request, split a large item, pause and resume the factory, and bring it back in
  order after a pack update. Use when the operator says "check the factory", "what is the
  factory waiting on", "where is issue N", "order this issue", "send this through the
  factory", "answer that ask", "land it", "send it back", "pause the factory", or starts
  a session on a project where the pack is set up.
  NOT for: setting the pack up (read the pack's README), or Archon's own commands and
  run control (use the archon-cli skill).
argument-hint: "[item key | ask ref | intent]"
---

# Operating the software factory

The pack `Wirasm/archon-software-factory` turns a **work order** into an **item** and moves
it through **stages**: order, triage, split (when needed), link, plan, build, check, host round,
land gate, land, landed check, discoveries drain. Each stage is one Archon run on the item.
**Bindings** start the next stage when one ends. A stage that needs a decision ends and
leaves an **ask**; the answer starts what follows. To **land** is to merge the change into
its landing branch.

You operate it for a person. You are an operator too: answer what their standing direction
already decides, and bring them only what is theirs.

Route by intent:

| The operator wants to... | Read |
|---|---|
| Know where an item is, why it does not move, or split a large one | `items.md` |
| Answer an ask, or read the report on a pull request | `asks.md` |
| Start a session, order work, pause, or handle a pack update | this file |
| Set the pack up or change a setting | the pack's README |
| Use an Archon command this skill does not teach (resume, cancel, wait, logs) | the `archon-cli` skill |

- Run every command from the project's checkout; the directory selects the project.
- In run lists a stage reads as `Wirasm/archon-software-factory:<stage>`, or as the bare stage name when the pack is run from a folder. Other packs' runs and items share the lists: a factory item is one whose runs include `order`.
- Answer and rule with `--as <a name for yourself>`, the same name every time, so the record says who decided.

## Each time a session starts

Do these before anything else, and tell the person what you found in a few lines.

1. `archon workflow status --json`: is the install hold set (`hold`), which runs are active,
   and which have a stalled tool call (`attention`).
2. `archon workflow attention --json`: every open ask, and every item that stopped (`kind: stopped`,
   with the stage, the outcome and why), including one whose last run failed, a run whose
   process is gone and a start that was refused. All of them wait on an operator. A stopped
   item takes no answer: `items.md`, "An item that stopped or failed", says what to run.
   An empty list means nothing recorded a stop; it does not prove every item is moving,
   so do step 4 as well.
3. `archon trigger check`: exits nonzero and names the file when a binding is broken.
   A broken binding refuses item runs on the whole install, so fix it first.
4. `archon workflow items --since 7d --limit 100 --json`: every item with a run in the window,
   each with its runs, open asks (`questions`), answers and merge. It is paged: pass the
   `next` value back until there is none. Look for an item with no merge, no open ask and
   no run in flight whose last run ended hours ago: that is one to read with step 5.
5. For an item that should be moving and is not: `archon workflow runs --item <key>`
   (`items.md` says what each outcome leads to). It
   says what a start waits behind, when a run's owner process is gone (with the `resume`
   and `abandon` commands), and when an admitted start is `unowned` (run it once with
   `archon trigger execute <request-id> --host <host-id>`). Never abandon a run because
   it is old; abandon only one whose process you have verified is gone.
6. With label intake set up: `archon workflow wake schedule status --json` shows whether
   the wake job is installed, registered, and what its last pass failed on.

Then keep one `archon workflow attention --watch --json` stream open as a background task
for the session (archon-cli skill, "Watch once").

## Ordering

A work order is a JSON file fired at the order binding. The order file is the
`...-order-<digest>.json` in the directory setup wrote the bindings to. If you cannot find
it, ask; do not guess a path.

```json
{ "key": "issue-123", "source": "https://github.com/<owner>/<name>/issues/123", "text": "", "land_on": "", "part_of": "" }
```

```bash
archon trigger fire --config <bindings-dir>/<the order file> --inputs order.json
```

`key` and one of `source` or `text` are required. A run reads the item as it was ordered:
an edit or a comment on the issue after the order reaches no later stage. Before ordering,
check that the issue states the problem, the desired outcome and what acceptance looks like.
A thin item produces a confident answer to the wrong question; fix the issue first.

- **Several items.** One order file and one fire per item, or one work order that lists
  them: `{ "key": "wo-12", "land_on": "", "items": [{ "key": "issue-41", "source": "..." },
  { "key": "issue-42", "source": "...", "depends_on": "issue-41" }] }`. Each member is
  recorded as part of `wo-12` and ordered by itself. `depends_on` is optional: the
  factory's link stage finds and records which member waits for which. Never run
  `archon workflow link` yourself. Stages queue past their capacity
  (three orders, five builds and one landing at once by default), so fire them all.
- **An item on its own branch.** Create and record the branch first, then order with
  `"land_on": "<branch>"`:
  `archon workflow landing --item <key> --branch <branch> --from origin/<base branch>`
- **Items that land together.** Create the branch on the work order's key as above, then
  fire the work order with `"land_on": "<branch>"`. The order records the branch and the
  members take it. Landing the branch on the base is not a stage: the operator does it.
- **The label as an order.** With label intake set up, adding the label `factory` to an
  issue orders it as `issue-<number>`. A label that was already there when intake was first
  seen starts nothing; remove it and add it again. Put it on issues only: a labelled pull
  request is ordered too.
- **`depends_on`** in an order, or on a member, states what the person already knows must
  land first. The link stage takes it as given: the item waits and goes on by itself when
  it has landed.
  `items.md` says how to read a waiting item.

## Pause and resume

`archon hold set` stops every new start on the install, not only the factory's. Running
stages finish, and orders, labels and answers are still recorded. `archon hold lift`
starts what was kept. Set it before a pack or Archon update, when the machine is needed,
or when spend must stop. Nothing lifts it on a timer, so say who must lift it.

## After a pack update

Follow "Update the pack" in the README, in this order:

1. `archon hold set --reason "updating the pack"`, and wait until `archon workflow status`
   shows no start queued. If the pack was already updated without a hold, set it now and go on.
2. `archon plugin update Wirasm/archon-software-factory`.
3. `archon pack bindings Wirasm/archon-software-factory --force` with the same `--repo`,
   `--host`, `--run-as`, `--out` and `--config` setup used. They are in the README's setup
   step and in the binding files setup wrote; if you cannot find them, ask. Do not guess.
4. Run every `archon trigger add` line it prints. A file with the same name replaces the old one.
5. Delete from Archon's triggers directory only the files an earlier `pack bindings` run
   wrote for this repository that are not in the new list. Leave every other file.
6. `archon trigger check`, and fix what it reports.
7. `archon hold lift`, then check that what the hold kept has started.
8. `archon skill add --pack Wirasm/archon-software-factory`, to replace this skill.

Runs that started before the update finish on the pack revision they started with.

## What the pack does not do yet

- Nothing enters on its own: every item is ordered by an operator, by hand or by label.
- The link stage waits only on a member of the item's work order or on what its order
  states; an outside item it names as `would_wait` and does not wait on.
- A waiting item is told when what it waits on ends, not when it only sits.
- A work order has no stage after the order: nothing starts when its last member lands.
- A host round that ends `waiting`, a triage judgment that is not `build`, `narrow` or
  `split`, and a plan that ends `stop` start nothing and leave no ask.
- Nothing lands without an answer unless the project set `land_gate: policy`.
- A split member that waits on a ruling or a signal starts only when the split runs
  again, and a split does not create the landing branch.
- Changes built side by side can conflict; the later one goes back to its builder.
- The discoveries drain files at most three items a run, and none without a tracker.
- No stage lands a shared branch on the base, and the report carries no screenshots.
