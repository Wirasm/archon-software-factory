# Overrule log

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
