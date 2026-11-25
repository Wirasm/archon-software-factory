# The rounds ran out: what should happen to this change?

A change was built and checked, sent back to its builder and checked again, and the rounds this stage allows are used up. The checks still return it, or say it should be planned again and it has been planned as often as it may without an operator. Do not fix anything and do not judge the change again. Decide what to ask the operator, and what you would recommend.

The item:

$INPUTS.item

What the last round's checks returned, merged:

$verdict.output

Read `$PACK_DIR/.shared/ask.md` first: it says what we expect in an ask.

Leave one ask. Its question is what should happen to this change now. Its context says, in a few plain sentences, what is still open and how serious it is, so the operator can decide without opening the run. Offer the options that really apply here, each with what it costs:

- send it back once more: the same builder continues and the checks run again. Right when what is left is new, small and clear.
- take it as it is: the change goes on to the host with what is left filed as follow-up work. Right when the checks agree the change does what the item asks and what is left is next to it. Also right when each round closed what it was given and the checks then found a new case of the same kind: more rounds will find more, so say in the context which kind is left open.
- replan: the approach cannot meet the item, so more rounds will not help. Right when the same kind of finding keeps coming back.
- split: the change is too wide to get right in one piece. Right when each round finds a new real defect somewhere else.
- drop: the change is closed without merging. Right when the item is no longer worth this change.
- reshape: the change stays open as a draft and the item is shaped again with the operator. Right when what is open is what the item should be, not how it was built.

Recommend one. When you have no basis to choose, recommend none: the operator then sees that the ask has no recommendation, which is better than a guess. Say why you cannot choose and what you would need to know to choose: the operator reads that in place of a recommendation. A finding that comes back in the same kind twice is the strongest signal you have. You are given only the last round's result above, so read the earlier rounds before you recommend: `archon workflow runs --item-of $WORKFLOW_ID` lists this item's runs, and `archon workflow get <run id> --json` holds what each earlier round of this stage returned and what an operator answered. Say what kind of finding each round returned, whether a kind came back, and what an operator already decided on it.

Look also at how the change's size moved. Its size at the end of each delivery run on this item since it was last planned, in files and lines added and removed against the commit the item's work was cut from, as the engine recorded it (`null` where it could not measure):

$sizes.output

Say in the context how it moved and after which return. A change that grew a lot after a return, and is returned for what it grew, points to removing what was added rather than another round of adding.
