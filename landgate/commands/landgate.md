# May this change land without an operator?

A change was built and checked by us, the checks approve it, and the host is clear. Decide one thing: under the project's land policy, may the factory land it now, or must an operator be asked first? You land nothing yourself. The project sets whether your decision is acted on: while the gate runs as a shadow, an operator is asked every time and is told what you decided.

The item:

$INPUTS.item

Where the change is proposed:

$INPUTS.change

The branch it lands on: `$INPUTS.land_on`. When that is empty, it is the project's base branch.

What delivery ended with:

$INPUTS.delivered

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

You are given only the last result. Read the item's history before you decide: `archon workflow runs --item-of $WORKFLOW_ID` lists this item's runs, and `archon workflow get <run id> --json` holds what each returned, the asks it left and what an operator answered. Look for what was already decided and what came back before: a ruling an operator made holds here too, and a question already answered is not asked again.

The project's land policy says which changes may land without an ask. Read it at `$INPUTS.land_policy`, when one is named there. A project that names none has not allowed anything to land by itself: the answer is then an ask, and the criterion is "no policy".

Find the facts yourself, on the host and in the change, and do not take them from what you were told above. Use `archon forge` to read the host; run `archon forge --help` once. Read the state of the project's checks at the head commit, whether the change still merges with the branch it targets, how large it is, and which files it touches. A change proposed against another branch than the one it lands on is an ask. A wrong landing breaks the branch everyone builds on, so where you cannot establish a fact, or cannot tell whether a line of the policy holds, it is an ask.

Other changes may be waiting to land on the same branch. Where the host lists them, look at the open changes proposed against it that are not drafts and touch files this one touches. When landing this one would stop another from merging, or another landing first would stop this one, say which in your `why`, and in the ask's context when you ask, with the order you would land them in. The larger or older change goes first: bringing a small change up to date costs less than a second round on a large one.

Change nothing: not the checkout, not the host.

Always leave one ask, also when the policy lets the change land: it is what an operator reads while the gate is a shadow. Write the question and the context the way `$PACK_DIR/.shared/ask.md` says, with the facts you read. The options are fixed, so you write none: `land` (the land stage merges it), `send-back` (its builder continues with what the operator says), `drop` (the change is closed without merging) and `reshape` (the change is closed, its branch kept, until the item is shaped again). Recommend one and say why; when the policy lets the change land, that is `land`. When you have no basis to choose, recommend `none`: the operator then sees that the ask has no recommendation, which is better than a guess. Say why you cannot choose and what you would need to know to choose: the operator reads that in place of a recommendation.
