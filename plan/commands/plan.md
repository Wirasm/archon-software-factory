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

Lay out the ways this could be built: the smallest change that does what the item asks, the most complete version, and a third when there is a different way to build it. For each, say what it builds on, how big it is and what it costs. Recommend one, and say in a line why. Then write the plan for the one you recommend, so a builder can make it without redoing your thinking.

If it cannot be built as stated, or something else has to exist first, stop and say what.
