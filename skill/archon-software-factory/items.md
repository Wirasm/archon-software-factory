# Where an item is, and splitting one

Read with the `archon-software-factory` skill. Run every command from the project's checkout.

## Where an item is

Where an item stands is never stored. It is the outcome of its last run plus its open asks.
Read both with `archon workflow runs --item <key>`.

| Last run ended | What happens next |
|---|---|
| order `ready` | Triage starts. `refused`: nothing; the result's `why` says what the order lacked. |
| order `work_order` | Each member listed in the order is ordered as its own item, part of this one. |
| order `waiting`, triage `waiting` | Nothing until what it waits on lands; then it is ordered again by itself. See below. |
| order `ask` | An ask is open: what it waits on ended without landing. `dropped`: the item ended. |
| triage `build`, `narrow` | Plan starts. |
| triage `split` | The split starts. |
| triage, any other judgment | Nothing, and no ask. `shape` lists open questions for a maintainer. Report it. |
| split `whole` / `split` / `waiting` | Plan / each member that starts now is ordered as its own item / nothing. |
| plan `planned` | Build starts. `ask`: an ask is open. `stop`: nothing; the result says why. |
| stage-build `built` / `built_for_host` | The checks / the host round. `replan`, `ask`: an ask is open. |
| stage-check `approve` / `return` | The host round / the builder. `replan`, `ask`: an ask is open. |
| stage-host `ready` / `return` | The land gate / the builder, then the host again. `ask`: an ask is open. |
| stage-host `waiting` | Nothing, and no ask. It gave up waiting for the project's checks. Report it. |
| landgate `land` / `ask` | The land stage / an ask is open. |
| land `landed` | The landed check and the discoveries drain. `returned`: the builder. `stop`, `ask`: an ask is open. |
| landed `broken_here` | A fix is ordered on the same item. Every other outcome is only recorded. |
| close `dropped` / `reshape` | The item ended / it waits to be shaped. `not_closed`: close the pull request by hand. |

A run's full result: `archon workflow get <run-id> --json`, under `terminal_record.returns.value`.
For a few seconds after a stage ends, the next one reads as admitted and not started.

## An item that waits

An item waits on the items it holds a `depends_on` link to that have not landed: those its
order declared, and, inside a work order or a split, those the link stage called blocking.
`archon workflow runs --item <key>` shows the links; the last order or triage run's result
has the keys in `waits_on`. When one of them lands the item is ordered again and goes on
when none is left.

When what it waits on is dropped, judged as not to be built, split, or stopped in planning,
the item gets an ask with no recommendation: `wait`, `start-anyway` or `drop`. That is the
person's call unless they told you how to rule on it.

Nothing tells a waiting item that what it waits on only sits: an unanswered ask, a key
that was never ordered, an issue closed by hand. Report an item that has waited long. To
release it, end the link and order the item by its key alone:

```bash
archon workflow link --end <link id>
archon trigger fire --config <bindings-dir>/<the order file> --inputs order.json   # { "key": "<key>" }
```

## Splitting a large item

Triage starts the split by itself when it judges `split`. To split an epic or a PRD
directly, put its text in a file and run:

```bash
archon workflow run Wirasm/archon-software-factory:split --item <key> --input-file item=<file>
```

`whole` starts plan on the item. `split` orders each member that starts now as
`<item key>-<member id>`; one that depends on another member waits as above. Members that
start later stay in the run's result with what they wait on. Nothing watches that: when it
has happened, run the split again, or answer the ask if it left one.
