# Land one change

Land this change on its landing branch, and only when it is sound to land.

The item:

$INPUTS.item

Where the change is proposed (empty when the project has no host):

$INPUTS.change

The landing branch: `$INPUTS.land_on`. When that is empty, it is the project's base branch. (A start by hand may give it under its older name: `$INPUTS.landing_branch`.)

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

The land policy says how this project lands a change. Read the pack's default at `$PACK_DIR/policy/land.md`. Then read the project's own at `$INPUTS.land_policy`, when one is named there. Where they differ, the project's wins.

## When the change is proposed on a host

Landing is merging the proposed change into the branch it targets. Use `archon forge` to read the host and to merge; run `archon forge --help` once. Read the facts yourself, now: they may have changed since the change was called ready.

What must hold:

- The branch the change targets is the landing branch. When it is proposed against another branch, stop and name both. Do not retarget it and do not merge it.
- It still merges with that branch, and the host's checks at its head commit are green. When it conflicts or a check is red, return it and say what a builder needs to fix. When checks have not finished, stop and say which.
- Merge it pinned to the head commit you read the checks at, so a change that moved since is refused, not merged.
- Change nothing else on the host, and nothing in the checkout.

## When the project has no host

You are in the change's checkout, on its branch; leave that branch as it is. The change, as build reported it, when this was started by hand:

$INPUTS.build

Make the tree the landing branch would have after this change, in a worktree of your own under `$NODE_SCRATCH_DIR`, and run the project's check on that tree, not on the change alone. The check, as the maintainers declared it:

$INPUTS.validate_command

When a check is declared, run exactly that command; when none is, use the one the maintainers use and say which.

What must hold:

- The landing branch moves only to a tree you checked and that passed.
- It moves only from the commit you started from. If it moved while you worked, start again from where it is now.
- Never move a branch that is checked out in another working tree. If the landing branch is, stop and say so.
- Push nothing.

## How it ends

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, and what we expect in one. The options of an ask here are fixed, so you write none: `land` (this stage tries again), `send-back` (the builder continues with what the operator says), `drop` (the change is closed without merging) and `reshape` (the change stays open as a draft until the item is shaped again). Recommend one. When you have no basis to choose, recommend `none`: the operator then sees that the ask has no recommendation, which is better than a guess.

End in one of four outcomes:

- **landed**: the change is merged into the landing branch, or with no host the landing branch now points at the checked tree.
- **returned**: the change does not land as it is, because it conflicts or a check fails. Say what a builder needs to know to fix it. It goes back to its builder and comes here again.
- **stop**: something outside the change prevents landing. Say what, and what you recommend. An operator is told.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here.
