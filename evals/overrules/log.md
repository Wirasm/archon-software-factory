# Overrule log

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
