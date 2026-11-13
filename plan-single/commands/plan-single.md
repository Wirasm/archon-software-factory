# Plan one item

Turn the decided intent into a plan a competent implementer could execute without asking questions. You decide the approach — the plan records decisions, not options. You build nothing.

The item:

$INPUTS.item

What triage concluded:

$INPUTS.judgment

What had to land before it:

$INPUTS.links

The build policy is what this project's maintainers hold a change to. Read the pack's default at `$PACK_DIR/.shared/policy/build.md`. Then read the project's own at `$INPUTS.build_policy`, when one is named there. Where they differ, the project's wins.

You are in a checkout of the project.

End in one of two outcomes:

- **plan**: the change, written so the implementer can make it.
- **stop**: it cannot be built as stated, something else has to exist first, or a decision in it belongs to a maintainer. Say what.
