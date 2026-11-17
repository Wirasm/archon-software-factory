# Cut one item into the work orders that build it

Decide whether this item is built as one piece of work, or as several members of one work order, and write each member so a planner and a builder can start from it with nothing else in hand. You are the maintainer who will own the whole outcome: cut it the way you would hand it to colleagues you trust.

The item:

$INPUTS.item

What triage concluded about it:

$INPUTS.judgment

Decisions an operator already made on this item:

$INPUTS.answers

A decision is part of the item. Where the item's text and a decision differ, the decision holds.

Where the whole lands, when an operator said: `$INPUTS.land_on` (empty means the project's base branch).

## Whole or split

Start from one piece. One run can plan and deliver a large change, and one change for one outcome is easier to check than several that only make sense together. Split only for a reason the item itself shows:

- its pieces are separate outcomes, each worth having on its own;
- a piece must land and be used before a later piece can be built or judged;
- two forms or surfaces share one mechanism, and one of them proves the mechanism while the other can follow;
- the work spans so many parts and surfaces that no single run could finish it.

Length, a long acceptance list, a large size, vagueness, and a title that says PRD or epic are not reasons. They are reasons to plan carefully. Do not cut by layer or by file: each member leaves the product working and shows something an operator can observe.

Read the project before you cut: what exists, what the item's claims rest on, and what a member would touch. A cut made from the item's headings alone is a guess.

## The members

Write every member, not only the first. For each:

- **What it is, as a work item.** Its brief states the problem, why it is worth solving, why now, the desired outcome, the invariants that must hold, and what acceptance looks like, in that member's own terms. State behaviour, not tests or file names. It must stand alone: the builder of a member does not read the parent.
- **Start now or later.** A member starts now when nothing it needs is undecided or unbuilt. Start the fewest that each prove something, often one.
- **What it depends on.** Name the members that must land before it. A dependency is real when the later member cannot be built or judged without the earlier one being used, not when it would merely be tidier.
- **What it waits on, when it starts later.** The ruling an operator must make, or the signal the earlier work must show. Say it so someone can tell when it has happened.

Keep the whole in view: together the members deliver the item, and nothing the item asks for is left in no member. If part of the item should not be built, say so in `left_out` with the reason; do not drop it silently.

## Landing

Say whether the members can each land on the base branch as they finish, or must land together on one branch that is then landed once. Together is right only when a member alone would leave the base in a state users should not meet. When they land together, name the branch.

## Rulings

List each question an operator has to answer before a later member can start, and which members it holds. Ask only what the item leaves open and you cannot settle by reading the project.

## What you return

- **whole**: the item is one piece of work. `members` holds that one member, with the item as its brief.
- **split**: the item is several members of one work order.
