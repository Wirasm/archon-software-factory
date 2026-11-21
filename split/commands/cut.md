# Split one item, or build it whole

Triage judged, or an operator said, that all of this item is worth building, but maybe not as one change. Decide how it is built: as one piece of work after all, or as members that each prove something on their own. You are the maintainer who owns the whole outcome: cut it the way you would hand it to colleagues you trust.

The item:

$INPUTS.item

What triage concluded and what it cut:

$INPUTS.judgment

What triage cut is settled, and is not yours to redo: you do not bring it back, and you cut nothing more. Everything that is left gets built, now or later. Triage's reason to split is a claim to check, not a decision.

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

A decision is part of the item. Where the item's text and a decision differ, the decision holds; do not ask it again.

Where the whole lands, when an operator said: `$INPUTS.land_on` (empty means the project's base branch).

What an earlier split of this item returned, `null` when there was none:

$INPUTS.earlier

The split policy says what each kind of item is and how it splits. Read the pack's default at `$PACK_DIR/policy/split.md`. Then read the project's own at `$INPUTS.split_policy`, when one is named there. Where they differ, the project's wins.

You are in a checkout of the project. Change nothing. Read it before you cut: what exists, what the item's claims rest on, and what a member would touch. A cut made from the item's headings alone is a guess. When the project has a tracker, read its open items and the pieces already filed from this item: `archon forge` searches the tracker and reads an item with its comments; run `archon forge --help` once.

## Decide

1. **The kind.** `prd`, `epic`, `bundle`, `parts` or `whole`, as the policy defines them.
2. **The members.** For every piece, say why it cannot be part of the same change as the rest. When no piece has such a reason, the answer is `whole`.
3. **What starts now.** The fewest members that each prove the next thing, often one. A member starts now when nothing it needs is undecided, unbuilt or unproven. Every other member waits, and says on what.

## The members

- **A member that starts now** carries a brief that stands alone, because whoever plans and builds it does not read the parent, and it goes through triage like any other item: the problem, why it is worth solving, why now, the desired outcome, the invariants that must hold, and what acceptance looks like, in that member's own terms. State behaviour, not tests or file names.
- **A member that starts later** carries its title, what it proves, the members it depends on, and what it waits on: the ruling an operator must make, the signal the earlier work must show, or the member that must land. Say it so someone can tell when it has happened. It gets no brief yet: the brief is written when it starts, from what the earlier work showed.
- **A remainder that waits on a ruling** is a member that starts later, even when everything else is built whole.

A dependency is real when the later member cannot be built or judged without the earlier one being used, not when it would merely be tidier. Together the members deliver all of the item.

When an earlier split already started members, keep their ids, do not start them again, and add what comes next.

## Landing

Say whether the members can each land on the base branch as they finish, or must land together on one branch that is then landed once. Together is right only when a member alone would leave the base in a state users should not meet. When they land together, name the branch, and say in `for_next` when someone has to create it.

## Asks

Leave an ask, the way `$PACK_DIR/.shared/ask.md` says, for each decision that is an operator's: a ruling a member waits on, or a piece the policy requires of the item and the item does not state. When the asks are answered, this stage runs again with the answers.
