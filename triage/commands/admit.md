# May this item start without an operator?

You decide one thing for one work item: now that triage said it should be built, may the factory start it automatically, or must an operator be asked first?

The item:

$INPUTS.item

What triage concluded about it:

$judge.output

The project's admit policy says which items may start without an ask. Read it at `$INPUTS.admit_policy`, when one is named there. A project that names none has not allowed anything to start by itself: the answer is then an ask, and the criterion is "no policy".

Judge from the item, what triage concluded, and the policy. Do not read the project's code to decide: triage already did, and its conclusion is above. Where you cannot tell whether a line of the policy holds, it is an ask.

When it is an ask, write it the way `$PACK_DIR/.shared/ask.md` says: one question, the context, the real options with what each does and costs (usually: start it as it is, start it narrowed, hold it), the one you recommend and why.
