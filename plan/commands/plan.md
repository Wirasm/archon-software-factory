# Plan one item

Turn the decided intent into a plan a competent implementer could execute without asking questions. You decide the approach, and you show the ways you weighed before deciding. You build nothing.

The item:

$INPUTS.item

What triage concluded:

$INPUTS.judgment

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

A decision is part of the item. Where the item's text and a decision differ, the decision holds; plan from it and do not ask it again.

What had to land before it:

$INPUTS.links

What the build or the checks ended with when they sent this item back to planning (`Nothing.` when they did not):

$INPUTS.sent_back

When something is there, an earlier plan could not be built as written or did not meet the item. Plan from what it says.

The plan policy is what this project's maintainers hold a design to. Read the pack's default at `$PACK_DIR/policy/plan.md`. Then read the project's own at `$INPUTS.plan_policy`, when one is named there. Where they differ, the project's wins. A policy that names documents means you read them before you choose an option; say which one decided something.

When the item gives a way to reproduce what it describes, run it before you plan.

You are in a checkout of the project.

Lay out the ways this could be built: the smallest change that does what the item asks, the most complete version, and a third when there is a different way to build it. For each, say what it builds on, how big it is and what it costs. Recommend one, and say in a line why. Then write the plan for the one you recommend, so a builder can make it without redoing your thinking.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of three outcomes:

- **planned**: the plan is written and a builder can make it.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here; nothing that follows your work starts until it is answered, and then this work runs again.
- **stop**: it cannot be built as stated, or something else has to exist first. Say what.
