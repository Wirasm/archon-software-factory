# Answering asks and reading the report

Read with the `archon-software-factory` skill. Run every command from the project's checkout.

## Answering asks

Yours to answer: an ask the person's standing direction already decides, where the attend
stage's advice (below) names an option and does not say `escalate`. The person's: any ask
about landing unless they told you which changes you may land; an ask whose answer adds or
changes something public (a format, an API, a stored shape); an ask the advice escalates;
and any ask on an item where a stage was already overruled. The project's rules for this
are in its attend policy: the file the `attend_policy` setting names in
`.archon/packs/Wirasm.archon-software-factory.yaml`. Read it once a session.

```bash
archon workflow attention --json                 # open asks, each with its ref, options and recommendation
archon workflow answer --ref ask:<id> --choose <option id> --text "<the reason>" --as <your name>
```

Every answer carries a reason in `--text`. The next stage reads it as a decision already
made, `send-back` hands it to the builder as the instruction, and `drop` and `reshape`
write it on the pull request. `--recommended` takes the place of `--choose` when you agree
with the recommendation; it is refused on an ask that has none. An ask without a
recommendation says in the recommendation's place why the stage could not choose: decide it or bring it
to the person, do not pick at random. To keep an item waiting, leave its ask open.

| Ask left by | Options |
|---|---|
| triage | `build`, `split`, `drop`, `reshape`. An answer in your own words starts triage again with it. |
| plan, split | The stage's own options for that question. Any answer starts the same stage again with it. |
| stage-build | `send-back`, `replan`, `take-as-is`, `drop`, `reshape`. |
| stage-check, stage-host | `send-back`, `one-more-round`, `replan`, `take-as-is`, `drop`, `reshape`. |
| landgate, land | `land`, `send-back`, `drop`, `reshape`. |
| link | `wait`, `start-anyway`, `drop`. Any answer starts the link stage again, which carries it out. |

Except for plan and split, each stage declares its options, so `archon workflow attention
--json` shows the same set on every ask of a stage, each with what it does and costs.

| Option | What it starts |
|---|---|
| `send-back` | The same builder, in its checkout, with your text. Then the checks again. |
| `one-more-round` | The builder with what was returned, then one more check round (check ask) or host read (host ask). If it is returned again, you are asked again. |
| `replan` | Plan, with your text, then delivery again. Use it when the approach is wrong, or the change should be cut differently. |
| `take-as-is` | After a build or check ask: the host round on the change as it is. After a host ask: the land gate. |
| `land` | The land stage. It merges only when the change still merges and its checks are green. |
| `wait` | On a link ask: the item keeps waiting, and goes on when what it waits on lands. |
| `build` | On a triage ask: the item is built as it stands; the link stage starts, then plan. |
| `split` | On a triage ask: the split stage cuts the item into members. |
| `start-anyway` | On a link ask: the link stage stops waiting and plan starts. |
| `drop` | The pull request is closed without merging. The item ends. |
| `reshape` | The pull request is closed without merging and its branch kept. Nothing more is built until the item is shaped and ordered again. |

When a run left several asks, answer all of them: the start happens when the last one is
answered. For delivery and landing asks, every answer must choose the same option, or
nothing starts. `archon workflow answer` prints what it started, or that nothing started.
Without an answer an item gets three check rounds and three host reads since it was last
planned; the third that would return the change asks instead (`archon workflow runs --item
<key>` shows the limits). After one `send-back` or `one-more-round` on top of those, prefer
`replan`, a split, or the person's ruling over another round.

A check returns a change only for a finding inside the item or caused by the change; what
is beside the item goes to discoveries. When a change grew across rounds and is returned
for what it grew, the usual answer is `send-back` with "remove what was added", not
another round of fixes.

The land gate asks before every merge unless the project set `land_gate: policy`. Its
ask's context says what the project's land policy would have done: "would have landed
this without asking" or "would have asked, because ...". That line is information for
your answer, not a decision: nothing lands until an answer chooses `land`.

## The attend stage's advice

When a run leaves asks, the `attend` stage reads the whole item and records, for each
ask, the option it would choose and why, or that the ask is the operator's. It answers
nothing. Read it before you answer:

```bash
archon workflow runs --item <key>                 # the attend run follows the run that asked
archon workflow get <attend run id> --json        # .terminal_record.returns.value.answers
```

Each entry has `ref`, `would` (an option id, or `escalate`), `text`, `why`, `confidence`,
`read` (what it saw that the asking stage did not) and `alone`. `escalate` means bring the
ask to the person. `alone` is true when the project's attend policy names that kind of
ask as one an agent may answer without the person; it is recorded only, so today it tells
you what the policy would allow and nothing answers by itself. The policy is the file the
`attend_policy` setting names: the person edits it to change what an agent may do alone.

An ask that is already answered no longer shows in attention. Its question, context and recommendation are in the asking run's result: `archon workflow get <run id> --json`, under `terminal_record.returns.value.asks`.

## Reading the report

Delivery keeps one comment on the pull request, headed `## Factory report:`, and replaces
it every round. Read it before you answer an ask or tell the person a change is ready.
In order: the open questions, the verdict's summary, a table of rounds, what must still
change (evidence folded), what the item asks for line by line (met, not met or not
checked, and whether that was run or read), notes that do not hold the change, and what
the project's own checks said. Findings with a file and a line are also posted on those
lines, one review per round. "Not checked" lines are yours to weigh before `land`.
