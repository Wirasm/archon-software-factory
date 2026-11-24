# Answering asks and reading the report

Read with the `archon-software-factory` skill. Run every command from the project's checkout.

## Answering asks

```bash
archon workflow attention --json                 # open asks, each with its ref, options and recommendation
archon workflow answer --ref ask:<id> --choose <option id> --text "<the reason>" --as <your name>
```

Every answer carries a reason in `--text`. The next stage reads it as a decision already
made, `send-back` hands it to the builder as the instruction, and `drop` and `reshape`
write it on the pull request. `--recommended` takes the place of `--choose` when you agree
with the recommendation; it is refused on an ask that has none. An ask without a
recommendation says in its context why the stage could not choose: decide it or bring it
to the person, do not pick at random. To keep an item waiting, leave its ask open.

| Ask left by | Options |
|---|---|
| plan, split | The stage's own options for that question. Any answer starts the same stage again with it. |
| stage-build, stage-check, stage-host | `send-back`, `replan`, `take-as-is`, `drop`, `reshape`. With the rounds used up, `one-more-round` replaces `send-back`. |
| landgate, land | `land`, `send-back`, `drop`, `reshape`. |
| link | The stage's own options. When an item this one waits on will not land: `wait`, `start-anyway`, `drop`. Any answer starts the link stage again, which carries it out. |

| Option | What it starts |
|---|---|
| `send-back` | The same builder, in its checkout, with your text. Then the checks again. |
| `one-more-round` | The builder with what was returned, and one more round for the item. |
| `replan` | Plan, with your text, then delivery again. Use it when the approach is wrong, or the change should be cut differently. |
| `take-as-is` | After a build or check ask: the host round on the change as it is. After a host ask: nothing; land or close the pull request by hand. |
| `land` | The land stage. It merges only when the change still merges and its checks are green. |
| `wait` | On a link ask: the item keeps waiting, and goes on when what it waits on lands. |
| `start-anyway` | On a link ask: the link stage stops waiting and plan starts. |
| `drop` | The pull request is closed without merging. The item ends. |
| `reshape` | The pull request becomes a draft. Nothing more is built until the item is shaped and ordered again. |

When a run left several asks, answer all of them: the start happens when the last one is
answered. For delivery and landing asks, every answer must choose the same option, or
nothing starts. `archon workflow answer` prints what it started, or that nothing started.
An item gets three check rounds and three host rounds. After one `send-back` by hand on
top of those, prefer `replan`, a split, or the person's ruling over another round.

## Reading the report

Delivery keeps one comment on the pull request, headed `## Factory report:`, and replaces
it every round. Read it before you answer an ask or tell the person a change is ready.
In order: the open questions, the verdict's summary, a table of rounds, what must still
change (evidence folded), what the item asks for line by line (met, not met or not
checked, and whether that was run or read), notes that do not hold the change, and what
the project's own checks said. Findings with a file and a line are also posted on those
lines, one review per round. "Not checked" lines are yours to weigh before `land`.
