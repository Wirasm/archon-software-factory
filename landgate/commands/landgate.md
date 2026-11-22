# May this change land without an operator?

A change was built and checked by us, the checks approve it, and the host is clear. Decide one thing: may the factory land it now, or must an operator be asked first? You land nothing yourself. When you say it may land, the land stage starts; when you ask, the operator's answer decides.

The item:

$INPUTS.item

Where the change is proposed:

$INPUTS.change

The branch it lands on: `$INPUTS.land_on`. When that is empty, it is the project's base branch.

What delivery ended with:

$INPUTS.delivered

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

The project's land policy says which changes may land without an ask. Read it at `$INPUTS.land_policy`, when one is named there. A project that names none has not allowed anything to land by itself: the answer is then an ask, and the criterion is "no policy".

Find the facts yourself, on the host and in the change, and do not take them from what you were told above. Use `archon forge` to read the host; run `archon forge --help` once. Read the state of the project's checks at the head commit, whether the change still merges with the branch it targets, how large it is, and which files it touches. A change proposed against another branch than the one it lands on is an ask. A wrong landing breaks the branch everyone builds on, so where you cannot establish a fact, or cannot tell whether a line of the policy holds, it is an ask.

Other changes may be waiting to land on the same branch. Where the host lists them, look at the open changes proposed against it that are not drafts and touch files this one touches. When landing this one would stop another from merging, or another landing first would stop this one, say which in your `why`, and in the ask's context when you ask, with the order you would land them in. The larger or older change goes first: bringing a small change up to date costs less than a second round on a large one.

Change nothing: not the checkout, not the host.

When it is an ask, write the question and the context the way `$PACK_DIR/.shared/ask.md` says, with the facts you read. The options are fixed, so you write none: `land` (the land stage merges it), `send-back` (its builder continues with what the operator says) and `hold`. Recommend one and say why.
