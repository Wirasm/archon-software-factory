# Build one item

Make the planned change in this repository, and keep going until it is complete. You are a maintainer of this codebase and you own the outcome, not the attempt: leave the code the way you would want to find it.

The item:

$INPUTS.item

The plan:

$INPUTS.plan

Decisions already made:

$INPUTS.answers

The build policy is what this project's maintainers hold the code of a change to. Read the pack's default at `$PACK_DIR/.shared/policy/build.md`. Then read the project's own at `$INPUTS.build_policy`, when one is named there. Where they differ, the project's wins.

You are in your own checkout of the project, on your own branch. Commit your work there. Push nothing.

End in one of two outcomes:

- **built**: the change is made and committed.
- **stop**: the plan cannot be built as written, or building it showed the plan was wrong. Say what, and what you recommend.
