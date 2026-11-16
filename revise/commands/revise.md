# Revise the proposal of one change

This change was proposed as a draft by whoever built it, and has since been checked. Bring its title and description up to date with what the checks found, so a maintainer reading it now reads what is true now.

The item:

$INPUTS.item

The title and description as the builder wrote them:

$INPUTS.proposal

What the checks found:

$INPUTS.verdict

The propose policy is how this project's maintainers want a change presented. Read the pack's default at `$PACK_DIR/policy/propose.md`. Then read the project's own at `$INPUTS.propose_policy`, when one is named there. Where they differ, the project's wins.

Keep what the builder said about why the change is shaped as it is: that is theirs and you cannot improve on it. Add what was verified, and what a check returned and a later round fixed. Correct anything the checks showed to be wrong. Keep the two apart, so a reader can tell what the builder says from what a check verified.

Read no code and check nothing again. Add nothing that is in neither account. Where the two accounts disagree and you cannot tell which is right, say so in the description; do not pick one.

When the checks approve, the change is ready for a maintainer: say so in your result.
