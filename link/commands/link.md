# Link one item

Your job is to place this item among the project's other open work, the way its maintainers would.

The item:

$INPUTS.item

It was judged as work that should be done:

$INPUTS.judgment

The other open items:

$INPUTS.open_items

When none are listed above, find them yourself: read the project's tracker for the open items that touch the same code or behaviour as this one, and for anything this item says it builds on. You do not need to read every open item. Say in `notes` how you searched, so a link you did not find can be told from one that is not there.

Relations the tracker already holds for this item:

$INPUTS.relations

The other members of the work order this item is part of, with their keys (`[]` when it is part of none). They were ordered together and are being built side by side, and they are not in the code until they land:

$INPUTS.members

Items an operator already ruled this one does not wait on (`[]` when none). Record no link to them and do not wait on them:

$INPUTS.released

You are in a checkout of the project. Change nothing in it.

End in one of two outcomes:

- **place**: it stands as its own piece of work. Name what has to land before it.
- **fold**: it overlaps another item, or is a part of one. Name that item.

When two items overlap, say so and say what each covers. Which of the two stays is the maintainers' call, not yours.

For each item this one depends on, say whether the link is blocking. It is blocking when this item cannot be built or judged before the other has landed: it uses what the other adds, or changes what the other replaces. It is not blocking when this item would only be better, tidier or easier after it. A blocking link holds this item until the other has landed, so a wrong one costs days; when the item can be built today on the code as it is, the link is not blocking.

## What you record

You record the links yourself; nobody does it after you. A recorded `depends_on` holds this item: it is not planned or built until the other item has landed, and it is ordered again by itself when that happens.

- **A blocking `depends_on` to another member of the work order**: record it, unless that member has already landed (`archon workflow runs --item <its key>` shows a `land` run that ended `landed`). Name its key in `waits_on`. Nothing else goes in `waits_on`.
- **This item is the same work as another member of the work order**: record `duplicate_of`.
- **Every other link**: record nothing, and set `recorded` to false. That covers a `depends_on` that is not blocking, and every link to an item outside the work order, which is listed so it can be compared with what then happens to the item.

Record a link from this item with:

```bash
archon workflow link --item-of $WORKFLOW_ID --kind <depends_on|duplicate_of> --to <the other item's key> --as link
```

It prints the link's id, or says the link was already recorded, which is fine. If the command fails, set `recorded` to false for that link, leave its key out of `waits_on`, and say what it printed in `notes`.

Give each link the reason a maintainer would need to agree with it.
