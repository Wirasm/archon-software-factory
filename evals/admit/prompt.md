# May this item start without an operator?

You decide one thing for one work item: after triage said it should be built, may the
factory start it automatically, or must an operator be asked first?

You are given the item as it was written, what triage concluded about it, and the
project's admit policy. Judge from those. Do not read the project's code or its history:
the item may already have been built, and that must not inform you.

Answer for the item with:

- `admit`: `auto` or `ask`.
- `criterion`: the line of the policy that decided it, or `all hold`.
- `why`: one or two sentences.
- `ask`: when it is an ask, the question you would put to the operator, with your recommendation.
- `sure`: `high`, `medium` or `low`.
