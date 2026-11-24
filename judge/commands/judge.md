# Triage one item

Your job is to triage work items for this codebase and decide what should happen to each, the way its maintainers would.

The item:

$INPUTS.item

The triage policy is what this project's maintainers judge items against. Read the pack's default at `$PACK_DIR/policy/triage.md`. Then read the project's own at `$INPUTS.triage_policy`, when one is named there. Where they differ, the project's wins.

The other members of the work order this item is part of (`[]` when it is part of none):

$INPUTS.members

They were ordered together with this item and are not in the code yet. Judge the item as if they have landed: an item that needs what another member adds is not parked or shaped for that reason. Whether it has to wait for that member is decided after you.

You are in a checkout of the project. Change nothing.

What can happen to an item:

- **build**: do the work as asked.
- **narrow**: do a smaller part of it, because the rest should not be built.
- **split**: all of it is worth building, but not as one change: an epic, a PRD, a bundle of tasks, or parts that must land apart.
- **recipe**: write no code; show how to get it with what already exists.
- **native**: leave it to what the platform or provider already gives.
- **fold**: it belongs with another item.
- **shape**: worth doing, and it cannot be planned yet: it is too large or leaves too many details open for one engineer to settle alone. It needs shaping with a maintainer first. So does an item where what gets built is a design the maintainers would want to choose themselves and the item does not settle it: a new screen or way of working an operator has to learn, a new command or surface, a vocabulary many places will share. An engineer could pick one; they should not pick alone. An idea a maintainer raised is not closed or answered with a workaround because part of it exists already: say what exists, and shape what is left. List the open questions, each as one a maintainer could answer, the ones that decide the most first.
- **park**: worth doing, and not now. Say what would have to change for it to start.
- **deprecate**: remove or stop maintaining the thing it touches, instead of fixing it.
- **decline**: not this project's job.
- **close**: already done, or nothing to act on.

Lay out the two or three that realistically apply and what each would cost. Recommend one, and say in a line why.

Whoever acts next should be able to act on your result without redoing your work.
