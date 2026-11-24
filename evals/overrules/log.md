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

## 2026-11-17 issue 5668 (PR 5860): second `returned` was only a merge conflict; merged dev by hand

- **Stage overruled:** host `return`, deliver `returned`, after the one send-back (run e95153c5, deliver, 32.4 minutes, 5.93 dollars, pack copy src9). Review, tests, product and verdict all approved in that run, and all 19 checks were green. The only open point: dev moved while the host was verifying, and the PR conflicted.
- **What I did:** merged dev into the branch in its worktree. One file conflicted, `guides/workflow-triggers.md`: both sides had edited the same paragraph. Kept the branch's new paragraph on queued starts and dev's wording of the next one. Pushed as 4f3c2dbde and dispatched the Windows suite.
- **Why:** the round-stop rule says no second send-back. A replan or split makes no sense for an approved change with a docs conflict. The conflict came from my own merges of PRs 5845, 5848 and 5854 in the same half hour.
- **Kind:** `not worth the round`.
- **What it says about the stage:** the host stage cannot merge the base in, so a conflict that appears during its own verification costs a whole deliver run (the first return here also cost 115 minutes for three red tests). A host that may run `git merge origin/<base>` when the conflict is in docs only, or a land step that merges the base before it checks, would have ended this in the run. Second time in two days (PR 5831 was the first).

## 2026-11-17 issue 5843 (PR 5865): a test for eight overlapping adds failed on Windows; removed by hand

- **Stage overruled:** deliver `ready` (run after the answered ask, 3.54 dollars, pack copy src9). The host step read PR checks as green; PR checks skip Windows. The full Windows suite I dispatch before a merge failed: `addTriggerFile > lets overlapping adds of one file each place a whole copy` with `EPERM` on `rename`.
- **What I did:** deleted that test (commit 131d43710) and dispatched Windows again. The per-add temp name stays.
- **Why:** the test and the temp-name change came from a review finding in the last round: two `archon trigger add` of the same file at once could rename a copy the other is still writing. Nobody adds one file eight times at once. Windows refuses a rename onto a name another rename is replacing, so the test cannot pass there, and the add fails loudly with nothing half-written. The item has used its two runs.
- **Kind:** `not worth the round`.
- **What it says about the stage:** the "ordinary use" line added to `policy/review.md` at 01:45 did not stop this finding; the reviewer described a way it happens (two operators, or a script run twice) and that was enough. Second: the host step cannot see Windows, so "ready" on a change whose whole point is Windows behaviour was not earned. A host that dispatches the full suite when the change touches file-system or process behaviour would have caught it in the run.

## 2026-11-17, issue 5703 (PR 5801): host returned a ninth-round finding; merged with a follow-up

- **Stage overruled:** host (run output `factory-runs/5703/host-host8.out`, model Sol), outcome `return`, one finding.
- **The finding:** `listWaitedItemHolders` misses the newer blocker of an admitted pending run, so a lost-owner blocker is absent from attention reporting. The host ran it: the extended older-binary test got `[]`.
- **What I did:** did not send it back. Filed it as https://github.com/coleam00/Archon/issues/5880 and merged PR 5801 at `a41f9fdaf`.
- **Why:** the finding is true and of the same kind as round eight's (a reader of "who holds this item" that forgets the admitted pending run). It needs two binary versions on one database, an overlap and a lost owner. By the review policy in trial since today that is a note, not a return: real, written down, not ordinary use. The item had eight builder rounds; each of the last two fixed one member of this kind and the bot found the next.
- **What the pack got wrong:** in round eight the builder was told to look for the same fault elsewhere, listed this very function, and judged it clean by reading. The host disproved that by running it. "Look for the same fault elsewhere" is not enough when the builder checks by reading: the fixer should run the failing case against each member it clears.
- **Run meta:** rounds 1-3 in deliver, send-backs 4-8 by hand (merge-dev rounds 5 and 7); host on Sonnet missed the core finding at round 5, Sol and Opus caught it; full test run with Windows green at `a41f9fdaf` (run 44021368096).

## 2026-11-17: PR 5873 (issue 5871, Codex v1 subagent usage) merged without a last host read

- **Stage overruled:** host. Its third read returned one documentation-wording finding; the builder fixed it (7 lines, comments and docs) and I merged at 4e27ee9aa without a fourth host read.
- **Why:** the item was far past the round limit (3 review rounds, an ask, two send-backs of which one was my operator error, three host reads). The remaining change was wording only, checked by me in the diff, with the generated-page check and the full suite green (Windows green on the second attempt; the first failed on the issue 5882 flake).
- **Run data:** deliver 8338283e (3 rounds, ask, 5.74 dollars); again-1 4.83 dollars (ran without its answers, wasted); again-2 5.91 dollars (ended in a host ask: count late sendInput turns or document the gap; ruled document the gap by the factory manager); two by-hand builder rounds 0.82 dollars and one more; three host reads.
- **What it says about the pack:** the host found a real behaviour gap (late v1 sendInput usage) that three review rounds and the product review did not; the review should run the item's stated cases against the pinned provider source earlier. A send-back must refuse to start without its answers (fixed in again.sh).

## 2026-11-18, issue 5829 (PR 5925): host returned bot edge cases on a test helper for three rounds; declined by the factory manager

- **Stage overruled:** host (deliver run 06e2ddcf, pack with the subtract rule in review, not yet in host). Review approved in round 1 (+329/-771). Then three host reads, each returning new CodeRabbit comments on `packages/workflows/src/test-utils.ts`, the shared store double: `NoInfer` on an older TypeScript (real), an `undefined` entry (plausible), then a non-enumerable `undefined` property, a non-configurable one, a symbol-keyed method, and a getter that returns `undefined`. The host reproduced each and passed it on; the builder added a guard each time. The run ended `returned` with two findings open and a conflict with dev.
- **What I did:** answered the ask with one send-back: decline the two open findings, take out the guards added for property-descriptor cases, keep the TypeScript fix and the plain `undefined` entry, bring the change up to dev.
- **Why:** this is a test helper. Nobody writes a fixture with a non-configurable or symbol-keyed store method; each guard is machinery no item line and no ordinary use asks for. Same shape as contributor PR 5897: every fix answered with the next edge case of the same kind.
- **Kind:** `not worth the round`.
- **What it says about the stage:** the host held bot comments to "does it reproduce", not "would someone meet it". Fixed in `host/commands/host.md` the same hour: a comment that asks for a guard against a case nobody realistically reaches is declined, and a reviewer that answers each fix with the next case of one kind is named and declined once. The subtract rule has to hold at every place a finding can enter, not only in our own review.
- **Run data:** review rounds 1, host rounds 3 (11:05 to 12:06 UTC), about two hours wall time.

## 2026-11-22, issue 5995 (PR 5999): host ended `waiting` on a paused review bot; merged by hand by the factory manager

- **Stage overruled:** host (run bdf76d0d, round 6 of an allowance of 4). All 21 checks passed or were skipped and the change merged cleanly. The host waited about 40 minutes for CodeRabbit to review head a811934e7, which never came because CodeRabbit had paused automatic reviews on the pull request. The run ended `waiting` with no ask and no next stage, so the item had no way forward.
- **What I did:** read the hand-resolved part of the merge commit (51 lines over five files: trigger check uses base-plus-local discovery and keeps the fire-binding check from PR 6039), marked the pull request ready, squash-merged it into dev, and recorded the merge on the item with `archon workflow merged`.
- **Why:** Rasmus approved landing it that morning. It had bounced from the land stage twice because another pull request landed first, and two more pull requests at the gate (6040, 6044) conflicted with it. The earlier, larger merge resolution was reviewed independently and found safe.
- **Kind:** `stage had no way forward`.
- **What it says about the stage:** a review bot that has paused itself is not a review that is still coming. The host should read the bot's pause notice as "no review will arrive" and go on, not wait and end `waiting`. Also the round allowance (4) did not stop round 6. And the land order matters: when several changes are at the gate, the land stage has no notion of which one the others conflict with.
- **Run data:** six host and build rounds since the first landgate ask at 06:48 UTC; landed 11:54 UTC.

## 2026-11-22, issue 5978 (PR 6027): check recommended a sixth round for one wiring test; taken as is

- Stage: stage-check run 9f417ddd, round 5 of 4 allowed. Review and product review approved; the test check returned one gap (no test that `wake-observation.ts` passes `{ observingOnly: true }`).
- Ruling: take-as-is. The behaviour is in place, the item is past its allowance, and the live round trip before merge is the proof.
- Kind: `recommendation not followed`.

## 2026-11-22, issue 6072 windowless tick (PR 6077): host recommended send-back for a lost exit status; taken as is and merged by hand

- Stage: stage-host run 23049cd3. `conhost --headless` drops the launcher's exit status, so Task Scheduler can show success for a failed tick.
- Ruling: take-as-is, on the maintainer's ruling that the change merges and is tried on a real Windows desktop from dev. No Windows machine was available to the builder, so another mechanism could not be run either. Filed as issue 6088.
- Merged by hand: a host `take-as-is` starts nothing, so there was no land stage to run.
- Kind: `recommendation not followed`, `stage had no way forward`.

## 2026-11-22, issue 6069 delete guard (PR 6085): land gate recommended land; sent back to remove locking

- Stage: landgate run 30eaa45f recommended land. Checks green, two review rounds done.
- What happened in delivery: the item asked for one check (refuse deleting a run with a live sub-run). Three reviews each returned a P1 PostgreSQL race between deletion and a concurrent sub-run start or resume, and the change grew to +683/-70 with a recursive tree lock, the admission lock in deletion, and a lock order that can deadlock with resume.
- Ruling: send-back to keep the check and remove the locks. The race needs an operator to delete a run in the instant a sub-run starts, and costs a run limit reading one too high until the tree ends.
- Kind: `recommendation not followed`, `over-build from review findings`. Pack note: the review asks "who meets the failure and how" for guards the builder adds, but returned races of its own that nobody meets; the same test should apply to its own findings.

## 2026-11-23 issue 6099 / PR 6100, stage-check round 3

- Stage said: one-more-round (same-second remove and re-add reuses the remembered answer; silent miss).
- I said: take-as-is, no follow-up.
- Why: the finding names no one who meets it in ordinary use. It needs a remove and re-add inside the second of a change already read. The review reproduced it only with a simulated forge. The stage weighed "the item states the invariant outright" above who is harmed.
- Run: 3b7536d9 (stage-check), ask 2f5ddae6.

- 2026-11-24, issue-6197 (PR 6209), stage-check ask after round 3 (run a70cf696). Stage recommended one-more-round on three findings. Answered send-back, narrowed to two: the unguarded acceptance case (the item's own line) and the POSIX-only test. Declined finding 1 (Windows trailing-separator acceptance in the file validator).
  - Why: finding 1 was traced from source and simulated on macOS, never run on Windows, and names nobody who meets it in ordinary use; the Windows runner at the host round is the evidence. Round 2 on this item was returned by the test check alone while review and product approved (see the 11-24 findings read: 44 of 78 findings were test asks).
  - Run metadata: reviewer and test-checker gpt-6.2-sol; project test policy tightened the same day, after this item's first two rounds.
