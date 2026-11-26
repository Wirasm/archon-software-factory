# Where an item is, and splitting one

Read with the `archon-software-factory` skill. Run every command from the project's checkout.

## Where an item is

Where an item stands is never stored. It is the outcome of its last run plus its open asks.
Read both with `archon workflow runs --item <key>`.

| Last run ended | What happens next |
|---|---|
| order `ready` | Triage starts. `refused`: nothing; the result's `why` says what the order lacked. |
| order `work_order` | Each member listed in the order is ordered as its own item, part of this one. |
| triage `build`, `narrow` | The link stage starts. |
| link `place` | Plan starts. |
| link `waiting` | Nothing until what it waits on ends; then the link stage runs again by itself. See below. An open ask means what it waits on will not land. |
| link `fold` | An ask is open: it overlaps another item. `dropped`: the item ended. `none`: nothing changed. |
| triage `split` | The split starts. |
| triage, any other judgment | An ask is open, with the judgment, its reason and, for `shape`, the open questions. `build` starts the link stage, `split` the split stage, `drop` and `reshape` the close step; an answer in the person's own words starts triage again with it. |
| split `whole` / `split` / `waiting` | Plan / each member that starts now is ordered as its own item / nothing. |
| plan `planned` | Build starts. `ask`: an ask is open. `stop`: nothing; the result says why. |
| stage-build `built` / `built_for_host` / `built_for_land` | The checks / the host round / the catch-up stage. `replan`: plan starts with what the builder said (once on an item; after that it asks). `ask`: an ask is open. |
| stage-check `approve` / `return` | The host round / the builder. `replan`: plan starts with what the checks said (once on an item; after that it asks). `ask`: an ask is open. |
| stage-host `ready` / `return` | The land gate / the builder, then the host again. `ask`: an ask is open. |
| stage-host `waiting` | Nothing, and no ask. It gave up waiting for the project's checks. The item shows as stopped in `archon workflow attention`. Report it. |
| landgate `ask` | An ask is open; its context says what the land policy would have done. With the setting `land_gate: policy`, a change the policy lets land ends `land` and the land stage starts. |
| land `landed` | The landed check and the discoveries drain. `behind`: the builder brings the change up to date with its landing branch, then the catch-up stage. `returned`: the builder, then the host round. `stop`, `ask`: an ask is open. |
| catchup `ready` | The land stage, with no host round and no second land gate: the change is the one that was approved, and its checks are green. `changed`: the host round, then the land gate. |
| landed `broken_here` | A fix is ordered on the same item. `unclear`, `broken_before`, `not_landed`, `waiting`: an ask is open (`fix` orders the fix, `dismiss` leaves it). `clear`, `none`: only recorded. |
| close `dropped` / `reshape` | The item ended / it waits to be shaped. `not_closed`: close the pull request by hand. |
| order-done `open` | Nothing: a member of the work order is still open. It runs on the work order's item each time a member lands or is dropped. `reported`: the order's report is in the result, and nothing was proposed. `proposed`: the members' shared branch is proposed against the base branch, and the land gate starts on the work order's item. `already`: reported before. |

A run's full result: `archon workflow get <run-id> --json`, under `terminal_record.returns.value`.
For a few seconds after a stage ends, the next one reads as admitted and not started.

## An item that stopped or failed

First read `archon workflow runs --item <key>`. When it says the item's change merged, the
item is done whatever its last run says: do nothing. Never order an item again that has a
change proposed; that plans and builds it a second time.

- **Its last stage failed, or was killed.** Resume it in place: `archon workflow resume <run-id>`.
  It keeps the run's id, inputs, source, configuration and checkout, skips the nodes that
  completed, and runs the rest; a run where no node completed runs again from its first node.
  When a resume is refused (its checkout is gone, or it was cancelled), start it again from
  its own record instead: `archon workflow run --supersedes <run-id>`, with no workflow name.
  Never start a stage by hand with `archon workflow run <stage> --item <key>` and nothing
  else: that run has none of the inputs the binding passes. Then read the item again and
  confirm the run is running.
- **Its run's process is gone.** The item read names the run with its `resume` and
  `abandon` commands. Resume it. Abandon only a run whose process you checked is gone.
- **A start was refused.** The item read says which binding and why. Fix the cause (a
  missing file a setting names, a provider with no credential), then restart the run that
  ended before it, as above.
- **A start limit is reached** (`Start limits: 2 of 2`). A returned change goes back to
  its builder twice without an operator; the third time the stage asks. Answer the ask.
  The count starts over when the item is planned again.
- **It ended where nothing starts** (a plan `stop`, a host round `waiting`). Report it with the stage's reason. When
  the person says it is over, end it: `archon workflow end --item <key> --as <you> -- <reason>`.
  An ended item leaves attention, and a new order opens it again.

## An item that waits

The link stage, an agent, decides after triage whether an item can be built now, and
records the links itself. Never record or end a link by hand, and never treat `depends_on`
in an order as required: it is only what the person already knows. An item that waits
holds a `depends_on` link to each item it waits on: another member of its work order or
split, or what its order states. `archon workflow runs --item <key>` shows the links; the
last link run's result has the keys in `waits_on`.

When one of those items lands, the link stage runs again on the waiting item and plan
starts. When it ends without landing (dropped, judged as not to be built, split, stopped
in planning), the link stage leaves an ask: `wait`, `start-anyway` or `drop`. With no
recommendation it is the person's call, unless they told you how to rule on it.

Nothing tells a waiting item that what it waits on only sits: an unanswered ask, an issue
closed by hand. Report an item that has waited long, and move its blocker: order it, or
answer its ask.

## Splitting a large item

Triage starts the split by itself when it judges `split`. To split an epic or a PRD
directly, put its text in a file and run:

```bash
archon workflow run Wirasm/archon-software-factory:split --item <key> --input-file item=<file>
```

`whole` starts plan on the item. `split` orders each member that starts now as
`<item key>-<member id>`, part of the item, exactly like a member of a work order; one that
depends on another member waits as above and goes on by itself. Members that wait on a
ruling or a signal stay in the run's result. Nothing watches that: when it has happened,
run the split again, or answer the ask if it left one.
