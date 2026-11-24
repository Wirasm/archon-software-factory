# Where an item is, and splitting one

Read with the `archon-software-factory` skill. Run every command from the project's checkout.

## Where an item is

Where an item stands is never stored. It is the outcome of its last run plus its open asks.
Read both with `archon workflow runs --item <key>`.

| Last run ended | What happens next |
|---|---|
| order `ready` | Triage starts. `refused`: nothing; the result's `why` says what the order lacked. |
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

## Splitting a large item

Triage starts the split by itself when it judges `split`. To split an epic or a PRD
directly, put its text in a file and run:

```bash
archon workflow run Wirasm/archon-software-factory:split --item <key> --input-file item=<file>
```

`whole` starts plan on the item. `split` orders each member that starts now as
`<item key>-<member id>`. Members that start later stay in the run's result with what they
wait on. Nothing watches that: when it has happened, run the split again, or answer the
ask if it left one.
