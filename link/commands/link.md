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
- **fold**: it is the same work as another item, or a part of one. Name that item.

Whoever orders the work next should be able to rely on your links without redoing them.
