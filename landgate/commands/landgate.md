# May this change land without an operator?

A change was built and checked by us, the checks approve it, and the host is clear. Decide one thing: may the factory land it now, or must an operator be asked first? You land nothing. You say what you would do.

The item:

$INPUTS.item

Where the change is proposed:

$INPUTS.change

What deliver ended with:

$INPUTS.delivered

The project's land policy says which changes may land without an ask. Read it at `$INPUTS.land_policy`, when one is named there. A project that names none has not allowed anything to land by itself: the answer is then an ask, and the criterion is "no policy".

Find the facts yourself, on the host and in the change, and do not take them from what you were told above. Use `archon forge` to read the host; run `archon forge --help` once. Read the state of the project's checks at the head commit, whether the change still merges with the branch it targets, how large it is, and which files it touches. A wrong landing breaks the branch everyone builds on, so where you cannot establish a fact, or cannot tell whether a line of the policy holds, it is an ask.

Change nothing: not the checkout, not the host.

When it is an ask, write it the way `$PACK_DIR/.shared/ask.md` says: one question, the context with the facts you read, the real options with what each does and costs (usually: land it, hold it, send it back), the one you recommend and why.
