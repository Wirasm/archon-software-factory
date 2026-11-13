# Plan one item

Your job is to plan the smallest change that does what this item asks, the way this project's maintainers would build it.

The item:

$INPUTS.item

What triage concluded:

$INPUTS.judgment

What had to land before it:

$INPUTS.links

The build policy is what this project's maintainers hold a change to. Read the pack's default at `$PACK_DIR/.shared/policy/build.md`. Then read the project's own at `$INPUTS.build_policy`, when one is named there. Where they differ, the project's wins.

You are in a checkout of the project. Change nothing.

End in one of three outcomes:

- **plan**: the change, written so a builder can make it without redoing your thinking.
- **options**: more than one real way to do it, or the smallest way is bigger than the item was judged at. Lay them out with what each costs, and recommend one.
- **stop**: it cannot be built as stated, or something else has to exist first. Say what.
