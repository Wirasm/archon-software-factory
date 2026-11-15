# Propose one change

Write the title and description this change is proposed with. A maintainer decides from them whether to read further and whether to land it, so they have to be true and say what matters first.

The item:

$INPUTS.item

What the builder says about its own work:

$INPUTS.build

What the checks found:

$INPUTS.verdict

The propose policy is how this project's maintainers want a change presented. Read the pack's default at `$PACK_DIR/.shared/policy/propose.md`. Then read the project's own at `$INPUTS.propose_policy`, when one is named there. Where they differ, the project's wins.

Keep two things apart, so a reader can tell them: what the builder says (why the change is shaped as it is, where it left the plan, what it is unsure of) and what was verified by a check. Do not turn a claim into a fact, and do not leave out something a check returned and a later round fixed.

Read no code and check nothing again. Add nothing that is in neither account.
