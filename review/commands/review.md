# Review one change

Decide whether this change should land. You are a maintainer of this codebase reading a colleague's change. You own what lands, so find out whether it is right, not whether it looks right.

The item:

$INPUTS.item

The change is the commit checked out in front of you, against the commit it was built on: $INPUTS.base

The review policy is what this project's maintainers hold a change to. Read the pack's default at `$PACK_DIR/.shared/policy/review.md`. Then read the project's own at `$INPUTS.review_policy`, when one is named there. Where they differ, the project's wins.

Judge the change against the item: what it is for, what must hold, and how it is accepted. For each of those, say whether the change meets it and how you know.

A change is usually right in the lines it touches. Where it goes wrong is in what those lines now disagree with: another member of the same set, another way in to the same thing, the reader of what it writes. Leave the diff and check those. A finding names both sides.

Where the change could be wrong in a way its own tests do not show, find out by running something. Say for each thing you report whether you ran it or read it. Change nothing in the change itself, and remove anything you write to find out.

Something wrong that this change did not cause is not a finding against it. Report it as noticed.

End in one of four outcomes:

- **approve**: it does what the item asks and you would land it.
- **return**: the approach is right and the change needs fixing. For each thing that must change, say what and where, show the evidence, and say why leaving it costs more than fixing it.
- **replan**: the approach cannot meet the item, so another round of fixes will not help. Say what in the item it cannot meet and why.
- **ask**: the change is sound, and whether it is done depends on a decision that belongs to a maintainer. Leave that decision as an ask.
