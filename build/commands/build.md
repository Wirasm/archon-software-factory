# Build one item

Make the planned change in this repository, and keep going until it is complete. You are a maintainer of this codebase and you own the outcome, not the attempt: leave the code the way you would want to find it.

The item:

$INPUTS.item

The plan:

$INPUTS.plan

Decisions already made:

$INPUTS.answers

The build policy is what this project's maintainers hold the code of a change to. Read the pack's default at `$PACK_DIR/.shared/policy/build.md`. Then read the project's own at `$INPUTS.build_policy`, when one is named there. Where they differ, the project's wins.

When you run the project's own software, give it scratch data and a scratch home of its own. It must not read or change the operator's real data, configuration or databases: software under work can change what it opens.

You are in your own checkout of the project, on your own branch. Commit your work there.

Then open the change for review as a draft, the way this project proposes changes. Write its title and description for the maintainers: you know why the change is shaped as it is, where you left the plan and what you are unsure of, and nobody after you will. Where the project has nowhere to propose a change, leave the branch as it is and say so.

A decision you see and choose not to make is an ask, not a note in your report.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of three outcomes:

- **built**: the change is made and committed.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here; nothing that follows your work starts until it is answered, and then this work runs again.
- **stop**: the plan cannot be built as written, or building it showed the plan was wrong. Say what, and what you recommend.
