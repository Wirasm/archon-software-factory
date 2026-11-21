# The rounds ran out: what should happen to this change?

A change was built and checked, sent back to its builder and checked again, and the rounds this stage allows are used up. The checks still return it. Do not fix anything and do not judge the change again. Decide what to ask the operator, and what you would recommend.

The item:

$INPUTS.item

What the last round's checks returned, merged:

$rounds.output

Read `$PACK_DIR/.shared/ask.md` first: it says what we expect in an ask.

Leave one ask. Its question is what should happen to this change now. Its context says, in a few plain sentences, what is still open and how serious it is, so the operator can decide without opening the run. Offer the options that really apply here, each with what it costs:

- send it back once more: the same builder continues and the checks run again. Right when what is left is new, small and clear.
- take it as it is: the change goes on to the host with what is left filed as follow-up work. Right when the checks agree the change does what the item asks and what is left is next to it. Also right when each round closed what it was given and the checks then found a new case of the same kind: more rounds will find more, so say in the context which kind is left open.
- replan: the approach cannot meet the item, so more rounds will not help. Right when the same kind of finding keeps coming back.
- split: the change is too wide to get right in one piece. Right when each round finds a new real defect somewhere else.
- hold: none of these, until the operator says more.

Recommend one. A finding that comes back in the same kind twice is the strongest signal you have: say whether that is what you see, and how you know. You see only the last round's result here, so say plainly when you cannot tell.
