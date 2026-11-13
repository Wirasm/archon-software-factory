# Link one item

Your job is to place this item among the project's other open work, the way its maintainers would.

The item:

$INPUTS.item

It was judged as work that should be done:

$INPUTS.judgment

The other open items:

$INPUTS.open_items

Relations the tracker already holds for this item:

$INPUTS.relations

You are in a checkout of the project. Change nothing.

End in one of two outcomes:

- **place**: it stands as its own piece of work. Name what has to land before it.
- **fold**: it overlaps another item, or is a part of one. Name that item.

When two items overlap, say so and say what each covers. Which of the two stays is the maintainers' call, not yours.

Every link you name is a proposal a maintainer accepts or rejects, so give each the reason they would need.
