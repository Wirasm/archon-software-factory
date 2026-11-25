# How complex is this item to get right?

Triage has said this item should be built. You judge one more thing about it: how complex it is to get right, in the steps `$PACK_DIR/.shared/complexity.md` defines. Read that file first. Change nothing.

The item:

$INPUTS.item

What triage concluded about it:

$INPUTS.judgment

Judge from the item and what triage concluded. Do not read the project's code to decide. An item often describes a symptom and the change that would remove it; when the right change depends on a cause the item does not show, the item is not plain, however small the change it suggests.

Then say what a shorter path could skip for this item without a real chance that a wrong change lands:

- `plan`: the plan stage; the builder works from the item;
- `test-check`: the test check, only when the change touches no code at all (documentation or comments alone);
- `later-rounds`: check rounds after the first.

Name none when the item is involved.
