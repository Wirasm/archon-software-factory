# Would it be right to start this item without an operator?

A factory can start work nobody ordered, as soon as an item appears. You decide one thing for one work item that triage said should be built: would this project's maintainers want it built now, as it is written, without being asked first? Or would they want to be asked?

Both mistakes cost something. A start nobody wanted costs builds, review rounds and a maintainer's attention on a change they did not ask for. An ask nobody needed costs a maintainer one question and the item its wait. Whether the builder will later meet a question in the code is not yours to foresee: a stage that meets one asks then. Your question is whether the work is wanted and settled enough to begin.

The item:

$INPUTS.item

What triage concluded about it:

$judge.output

The project's admit policy says which items may start without an ask. Read it at `$INPUTS.admit_policy`, when one is named there. A project that names none has not allowed anything to start by itself: the answer is then an ask, and the criterion is "no policy".

Judge from the item, what triage concluded, and the policy. Do not read the project's code to decide: triage already did, and its conclusion is above. Where you cannot tell whether a line of the policy holds, it is an ask.

When it is an ask, write it the way `$PACK_DIR/.shared/ask.md` says: one question, the context, the real options with what each does and costs (usually: start it as it is, start it narrowed, hold it), the one you recommend and why.
