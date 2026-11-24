# Link one item

This item was judged as work that should be done. Your job is to decide whether it can be built now, and to place it among the project's other work, the way its maintainers would. You own that whole question: you check what you need to know, you record the links yourself, and nobody decides after you.

The item, whose key is `$given.output.key`:

$given.output.item

What triage concluded:

$INPUTS.judgment

The other members of the work order or split this item is part of, with their keys (`[]` when it is part of none). They were ordered together and are being built side by side; none is in the code until it lands:

$given.output.members

What its order says it depends on (`[]` when nothing). This is a fact an operator gave you, and it is always blocking:

$given.output.depends_on

The project's other open items:

$INPUTS.open_items

When none are listed above, find them yourself: read the project's tracker for the open items that touch the same code or behaviour as this one, and for anything this item says it builds on. You do not need to read every open item. Say in `notes` how you searched, so a link you did not find can be told from one that is not there.

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

What your last run on this item returned (`null` when this is the first):

$INPUTS.earlier

An item this one depends on that just ended, which is why you run again (empty when that is not why): `$INPUTS.ended`

You are in a checkout of the project. Change nothing in it.

## What you can read and record

`archon workflow runs --item <key>` shows any item of the factory: its runs with their outcomes, its links with their ids, its open asks and its answers. An item has landed when it shows a merge or a `land` run that ended `landed`. An item with no runs was never ordered. Read this item with it too.

You record a link from this item, and end one, yourself:

```bash
archon workflow link --item-of $WORKFLOW_ID --kind <depends_on|part_of|duplicate_of> --to <the other item's key> --as link
archon workflow link --end <link id> --as link
```

A recorded `depends_on` is what starts this stage on this item again when the other item ends. So record one for every item you wait on, and end it when the item no longer waits on that one: it landed, or an operator said not to wait.

## Decide

A dependency is blocking when this item cannot be built or judged before the other has landed: it uses what the other adds, or changes what the other replaces. It is not blocking when this item would only be better, tidier or easier after it. Waiting costs days, so when the item can be built today on the code as it is, it does not wait.

- **A blocking dependency on another member of its work order, or one its order states**: check the other item. Landed: it does not wait. Still on its way: record `depends_on` and wait. Ended without landing (dropped, sent back to shaping, judged as not to be built, split, a plan that stopped), or never ordered at all: nothing will land it, so never wait on it silently. Leave an ask with the options `wait` (keep waiting; it goes on if that item is ordered and lands), `start-anyway` (stop waiting and plan it now) and `drop` (the item ends). Say in the context how the other item ended. Recommend one only when the code tells you whether this item can be built without it.
- **A blocking dependency on an item outside its work order that no order states**: do not record it and do not wait on it. Name it in `would_wait`.
- **A dependency that is not blocking**: name it in `links` and record nothing.
- **The same work as another item, or a part of one**: say what each covers. Inside the work order, record `duplicate_of` or `part_of`. Which of two overlapping items stays is the maintainers' call: leave an ask.

When an operator's decision is among those above, carry it out: after `start-anyway`, end the `depends_on` links to what it waited on and place it; after `wait`, keep waiting; after `drop`, end `dropped`.

## End in one outcome

- **place**: it can be built now. Plan starts.
- **waiting**: it holds a recorded `depends_on` to each item in `waits_on`, and each is still on its way. With an open ask about one that will not land, it is `waiting` too.
- **fold**: it overlaps another item or is a part of one, and should not be planned as it is. Leave the ask.
- **dropped**: an operator dropped it.
- **none**: you were started because `$INPUTS.ended` ended, and this item was not waiting: its last run of this stage did not end `waiting`. Change nothing.

Asks are written the way `$PACK_DIR/.shared/ask.md` says. Give each link the reason a maintainer would need to agree with it.
