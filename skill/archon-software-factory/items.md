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
| triage, any other judgment | Nothing, and no ask. `shape` lists open questions for a maintainer and shows the item as stopped in `archon workflow attention`. The others end the item and are not listed. Report it. |
| split `whole` / `split` / `waiting` | Plan / each member that starts now is ordered as its own item / nothing. |
| plan `planned` | Build starts. `ask`: an ask is open. `stop`: nothing; the result says why. |
| stage-build `built` / `built_for_host` | The checks / the host round. `replan`: plan starts with what the builder said (once on an item; after that it asks). `ask`: an ask is open. |
| stage-check `approve` / `return` | The host round / the builder. `replan`: plan starts with what the checks said (once on an item; after that it asks). `ask`: an ask is open. |
| stage-host `ready` / `return` | The land gate / the builder, then the host again. `ask`: an ask is open. |
| stage-host `waiting` | Nothing, and no ask. It gave up waiting for the project's checks. The item shows as stopped in `archon workflow attention`. Report it. |
| landgate `ask` | An ask is open; its context says what the land policy would have done. With the setting `land_gate: policy`, a change the policy lets land ends `land` and the land stage starts. |
| land `landed` | The landed check and the discoveries drain. `returned`: the builder. `stop`, `ask`: an ask is open. |
| landed `broken_here` | A fix is ordered on the same item. Every other outcome is only recorded. |
| close `dropped` / `reshape` | The item ended / it waits to be shaped. `not_closed`: close the pull request by hand. |

A run's full result: `archon workflow get <run-id> --json`, under `terminal_record.returns.value`.
For a few seconds after a stage ends, the next one reads as admitted and not started.

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
