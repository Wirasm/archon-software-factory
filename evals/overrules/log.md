# Overrule log

## 2026-11-16: a hand start takes a free slot; the stage recommended keeping FIFO

- **Item and change:** Archon issue 5688 (a stage starts when a run on the item ends), draft PR 5744. Head `fb12fc6e2`.
- **Run:** `deliver`, run `0ab1df97-56a3-4b44-8cc1-fc27d0e87d14`, round 3 of 3 (rounds used up). The ask came from the test check (`claude/haiku`, told) and was carried by the verdict (`claude/haiku`). Whole run: 92.9 min, 69,073,934 input and 447,600 output tokens, 17.61 USD recorded. Pack copy `src6` (repo commit `6f76e41`); `tests.md` hash `d5db34b6`.
- **What the stage returned:** an ask with two options and the recommendation `keep-fifo`: "The queued start waits for its own host, and free-slot-first lets a hand start skip work that is not blocked by a slot. Would change if acceptance line 4 is meant literally, which the review and product review both read it as."
- **What was done instead, and by whom:** Claude, acting for the operator, ruled `free-slot-first`: order holds among starts waiting for a slot; a start waiting only for its own host holds no slot and blocks none. The other two asks were ruled as recommended (the ending process starts what its completion caused; recovery after a kill between admission and spawn is explicit). Rulings are on the issue and went to the builder.
- **Why:** Acceptance line 4 is meant literally. It was written from a measured backlog (issue 5665) where starts sat queued or were refused with every slot free. The stage itself named this as the condition that would change its answer, and two of three checks read the line that way.
- **Kind:** `better fix`.
- **What it says about the stage:** The ask was the right outcome: three checks disagreed on what meets the item, and the test check asked instead of picking. The recommendation leaned on the code as it is (FIFO exists) over the item's stated line. Not a prompt gap yet; one case. Separate finding from the same run: with the rounds used up and asks open, the run could not take the rulings. The findings and rulings went to a fresh builder by hand, losing the builder's context on a 2,000-line change. Rulings on the item (engine PR 5730) read at each round would have kept the same run going.

## 2026-11-16: resume of a run with no completed node split off the resume change

- **Item and change:** Archon issue 5699, branch `factory/5699`. Base `9ea33a98d`, head `845bd0972`.
- **Run:** `review`, first check, `codex/gpt-6.1-sol`, not told (nothing was returned before). 4m9s. Stage prompt `review.md` at pack commit `ae7fc12` (with the "repeated kind of finding" sentence). The test check in the same round failed on output format (Haiku, five attempts, missing `for_next`) and was re-run on Sonnet.
- **What the stage returned:** `return`. "Finish ownerless recovery for runs with zero completed nodes. The new ownership check accepts these runs, but engine hydration still refuses them."
- **What was done instead, and by whom:** Claude, acting for the operator, did not send it back. Filed as Archon issue 5720.
- **Why:** The refusal the reviewer hit is older than the change and applies to failed runs too: resume refuses any run with nothing completed and prints a `--supersedes` relaunch command. The change makes a killed run resumable on the same terms as a failed one, which is what the item asks. Whether a run with nothing completed should restart in place is a separate decision with its own invariants.
- **Kind:** `scope`.
- **What it says about the stage:** Second scope overrule where the gap predates the change (the first was issue 5696, 2026-11-15). The reviewer ran a good probe and read the acceptance line broadly. Same hypothesis as before: when a finding is about behaviour next to the change, say whether the base has the same gap, and report it as noticed when it does. Worth a sentence in review.md now that it has happened twice.

## 2026-11-15: chat readers of the outcome left for a follow-up

- **Item and change:** Archon issue 5660, PR 5698. Base `d5d99c9bb`, head `9b89b7f97`.
- **Run:** `review`, run `d0f69ab8-5a07-4705-85c6-4458565a38ec`, `codex/gpt-6.1-sol`, round 5, told. 2m46s, 1,028,811 input and 5,652 output tokens. Stage prompt `review.md` hash `e76bb5c73519`. The test check in the same round returned `sound`.
- **What the stage returned:** `return`. "Carry named completed outcomes through chat notifications. Both terminal attention notices and live terminal events silently drop them, and the chat contract cannot represent them."
- **What was done instead, and by whom:** Claude, acting for the operator, did not send it back. The gap was filed as Archon issue 5708, written into the pull request under "Left for a follow-up", and the pull request went to CI and the operator's read.
- **Why:** The finding is true and was already decided. In round 2 the builder was told: "chat events, the attention notice and the watch's terminal line can stay on the boolean form and be listed in the pull request as not yet reading the new column." The change was already XL (+1,212/-732 over 124 files). The reviewer was never shown that decision, and the pull request did not list it until now.
- **Kind:** `scope`.
- **What it says about the stage:** This overrule was caused by the runner, not the reviewer. A scope decision made for the builder never reached the reviewer, so the reviewer found the gap again and correctly called it drift. Hypothesis: decisions on an item (what is deliberately left out, and where it is tracked) belong to the item and go to every stage that judges the change; and the builder's first draft description must carry them.

## 2026-11-15: load check for command-file references split off the loop fix

- **Item and change:** Archon issue 5696, PR 5700. Base `6bfa11271`, head `0e035c5f5`.
- **Run:** `review`, run `2cbcd68b-8b6c-414f-8646-4b78858bc913`, `codex/gpt-6.1-sol`, round 2, told what round 1 returned and what the builder replied. 2m36s, 1,133,347 input and 5,158 output tokens. Stage prompt `review.md` hash `e76bb5c73519`. The test check in the same round returned `sound`.
- **What the stage returned:** `return`. "Validate previous-round include references in command-file bodies at load. The new rejection check only scans inline template slots, so moving the same invalid reference into a command file bypasses it."
- **What was done instead, and by whom:** Claude, acting for the operator, did not send it back. The pull request went to CI as it was, and the finding was filed as Archon issue 5706.
- **Why:** The finding is true, and wider than the change. On dev the loader checks no output reference in any command file: `archon validate workflows` refuses `prompt: "... $nosuch.output.field"` and passes the same sentence in a command file. The change did not create the gap, and closing it is a loader change of its own.
- **Kind:** `scope`.
- **What it says about the stage:** The reviewer read the issue's acceptance line ("a reference the engine cannot resolve is refused at load") as covering every place a reference can be written. It could not know the gap predated the change without checking dev. Hypothesis: when a finding is about behaviour next to the change, the reviewer should say whether the base has the same gap, and return it as `noticed` when it does.

## 2026-11-15: empty-string outcome refused at load, in place of a fourth reader fix

- **Item and change:** Archon issue 5660, draft PR 5698. Base `d5d99c9bb`, head `85c931133`.
- **Run:** `review`, run `d4fd8b7b-faed-4211-ba39-2beb371dd282`, `codex/gpt-6.1-sol`, round 4, told. 5m6s, 1,979,044 input and 9,438 output tokens. Stage prompt `review.md` hash `e76bb5c73519`. The test check in the same round returned `sound`.
- **What the stage returned:** `return`. "Allow fixture.authored to assert an empty-string enum outcome, and replace the test that incorrectly requires rejecting it."
- **What was done instead, and by whom:** Claude, acting for the operator, told the builder to refuse an empty string in a `returns` outcome enum when the workflow loads, and to leave `fixture.authored` as it was. Built as `9b89b7f97`. The operator is told in the pull request and can reverse it.
- **Why:** It was the third round in a row to find one more reader mishandling `''`: the console in round 2, four CLI and core views in round 3, the fixture runner in round 4. An outcome is a name an operator and a later stage read, and an empty one says nothing. The builder then confirmed nothing shipped could depend on it: on dev an outcome must be a boolean, and named outcomes exist only on this branch.
- **Kind:** `better fix`.
- **What it says about the stage:** Each finding was correct on its own, and the builder had flagged in round 3 that refusing `''` "would be a separate language decision". Neither stage raised it as an ask, so three rounds were spent on the symptom. Hypothesis: when a reviewer returns the same class of finding a second time, it should name the class and ask whether the case should exist; and a builder that sees a decision it will not make should return it as an ask, not a note.

## 2026-11-16: a loop-path test for a changed provider not sent back a fifth time

- **Item and change:** Archon issue 5711, draft PR 5780. Base `1bd1f6cce`, head `e0e1ae6dd`.
- **Run:** `tests`, run `f3792e7a-73f2-456b-9a4c-0d7ade9937e4`, `claude/haiku`, round 4 (the first send-back after three rounds inside the run), told. 4,928,713 input tokens. Pack copy `src7`. The review in the same round returned `approve`.
- **What the stage returned:** `return`, one finding, `item_asks_unguarded`: removing the provider comparison on the loop-body path fails no test; it gave the test to add in full.
- **What was done instead, and by whom:** Claude, acting for the operator, did not send it back and moved the change on to the host stage.
- **Why:** The stop agreed with the operator the same day: after the three rounds in the run and one send-back, decide instead of sending back again. The behaviour is implemented and the review approves. The comparison is one shared function that a test on the item path already guards; what is unguarded is the loop path calling it with the provider. One more round would cost a full builder turn for one test.
- **Kind:** `not worth the round`.
- **What it says about the stage:** The finding is correct and well evidenced, and the stage's recipe was complete. This is the half of a round-3 finding the builder did not finish, so the miss is the builder's. Hypothesis to check on later runs: the fixer now reads the three reports as written (trial from 11-16); a finding half-fixed because the verdict shortened it should become rarer.

## 2026-11-16: an interrupted round's stale scratch split into its own issue at round 8

- **Item and change:** Archon issue 5745, PR 5759. Base `babfb0764`, head `183511cfd`.
- **Run:** `review`, run `8138d382-d179-40d7-832a-2240f51cff99`, `codex/gpt-6.1-sol`, round 8, told. 1,656,641 input tokens. Pack copy `src7`.
- **What the stage returned:** `return`: a body node re-run after an interrupted round gets its killed predecessor's scratch; with a registered worktree in it, resume fails. Reproduced by the reviewer in a copy.
- **What was done instead, and by whom:** Claude, acting for the operator, filed it as Archon issue 5809 and moved the change on to the host stage. The operator is told.
- **Why:** Round 8, each sent back by hand. The finding is real, but it lives where this change meets PR 5758 (a resumed loop continues its round), which merged the same day after this item was planned. Nothing shipped uses node scratch yet, so no existing workflow regresses; the two items waiting to adopt it (5761, 5691) are held by this change not landing.
- **Kind:** `split`.
- **What it says about the stage:** The reviewer was right, and said itself that the interrupted-round behaviour predates the change while the preserved scratch is new. No stage can say "this is now a second item": the only outcomes are approve and return. Hypothesis: a check needs a way to return a real finding as a follow-up item when the change is otherwise sound and the finding comes from another change landing meanwhile; and the round count needs a stop the pack owns.

## 2026-11-16: a test returned only for asserting a log event name

- **Item and change:** Archon issue 5745, PR 5759. Base `babfb0764`, head `183511cfd`.
- **Run:** `tests`, run `6ee15011-c7b9-474f-8205-fee261582d15`, `claude/haiku`, round 8, told. 3,446,028 input tokens. Pack copy `src7`.
- **What the stage returned:** `return`, one finding, `fails_for_other_reasons`: one assertion checks the event name of a logged failed release; renaming the key fails the test with no change in behaviour. It said itself "not a merge blocker on its own".
- **What was done instead, and by whom:** Claude, acting for the operator, treated it as a note and did not send it back.
- **Why:** The pack's own trial rule since 11-16: an excess test or assertion is a note, never a return by itself. Fifteen other tests in the file were judged to earn their place.
- **Kind:** `stage broke its own rule`.
- **What it says about the stage:** The `noted` tier did not hold: the stage classified a wording-only assertion as a fault and returned on it alone. Second time seen. Hypothesis: the outcome rule has to say it in the outcome list itself (return only when a behaviour the item asks for is unguarded or a test cannot fail), not only in the paragraph on notes.

## 2026-11-16: a text-mode check of a refusal message not sent back after three rounds

- **Item and change:** Archon issue 5652 (links between items), draft PR 5810. First item through the wired chain: triage, plan and deliver each started by the engine.
- **Run:** `deliver`, run `1bc1777d-eb3c-457a-8a8a-e3b8dfa91307`, 78.7 minutes, 8.90 dollars; the `tests` check in round 3 on `claude/haiku`, 10.5 minutes. Pack copy `src8` (factory repo 88682ca). Review and product review approved in the same round.
- **What the stage returned:** `return`, one finding, `item_asks_unguarded`: the self-link refusal is checked only with `--json`, so emptying its message fails no test. It asked for one text-mode run asserting that stderr names the item, not the wording.
- **What was done instead, and by whom:** Claude, acting for the operator, did not send it back and started the host stage on the pull request.
- **Why:** The refusal itself is proven (the JSON path), and the unknown-kind refusal's message is already checked. What is left is whether one message is non-empty. The project's test rulings put error wording outside what tests protect; this is close to that line. The rounds in the run were used up.
- **Kind:** `not worth the round`.
- **What it says about the stage:** The finding follows from the item's own acceptance line, which Claude wrote ("refused with a message that says why"). The line asked for a message, so the check asked for its proof. The miss is in the brief: say "is refused", and leave the message to the builder. Third `item_asks_unguarded` return in one day that came from an acceptance line worded more tightly than meant.

## 2026-11-16: two real findings on the asks change split into issues after its one send-back

- **Item and change:** Archon issue 5640 (a finished run leaves asks on its item), draft PR 5807. Head `5306f9a7b`.
- **Run:** `review`, re-check after round 3, `codex/gpt-6.1-sol`, told; `tests`, same round, `claude/haiku`. Pack copy `src7`.
- **What the stages returned:** review `return`, two reproduced defects: two runs of one workflow on one item completing at the same moment on PostgreSQL leave two open ask sets; and the item read reports a set as settled when an open ask in it cannot be read. Tests `return`, two groups of tests that assert message wording.
- **What was done instead, and by whom:** Claude, acting for the operator, filed the two defects as Archon issues 5824 and 5825, treated the wording findings as notes, and started the host stage.
- **Why:** The stop agreed with the operator: three rounds in the run, one send-back, then decide. All four earlier findings were fixed in the send-back. The first defect needs two runs of the same workflow on one item at once, which issue 5703 (in checks) removes as an ordinary case. The second needs an unreadable ask row. Neither blocks what waits on this change: asks reaching the operator, the start when asks are settled, the tracker comment, and two web-side items.
- **Kind:** `split`; and for the tests return, `stage broke its own rule` (third time: a wording-only assertion returned by itself).
- **What it says about the stage:** The review found a new real defect in each of three passes over a 1,900-line change, each correct. That is the size of the change showing, not a faulty review: the plan sized it l and it went to build as one piece. The reviewer's second finding was introduced by the fix to its own earlier finding, which the builder's "after a fix, go through each thing the item asks for" line did not catch.

## 2026-11-17 issue 5840 (PR 5841): rounds ran out twice; trimmed by hand instead of a third send-back

- **Stage overruled:** verdict `returned` after the again-run (run 1db7878e, deliver, pack copy src9, reviewer codex gpt-6.1-sol, test check and verdict sonnet). Open finding: reject multi-host URL authorities, percent-encoded separators included, and reword the PGSERVICE refusal.
- **What I did:** removed the refusals for empty host entries, repeated URL parameters and services (78 lines to about 20 in the guard, a 13-input test loop deleted) and kept one rule: PGHOST, PGHOSTADDR or a DATABASE_URL host must be set. Marked the PR ready.
- **Why:** the item's failure is a check run with no server named, which reached a PostgreSQL that was not ours. Every round since round 2 added a guard for a setting nobody writes by accident (`PGHOST=,`, a hostless service file). That is speculative hardening; each fix gave the reviewer a new libpq corner to find, so the rounds could not end.
- **Finding for the pack:** `policy/review.md` has no line against speculative hardening. Trial added the same day: a finding needs a way the failure happens in ordinary use.
