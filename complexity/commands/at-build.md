# How complex was the change that was built?

A change was built for this item. Judge how complex it was to get right, in the steps `$PACK_DIR/.shared/complexity.md` defines. Read that file first. Change nothing.

The item:

$INPUTS.item

Where the change is proposed: $INPUTS.change

Judge the change itself, not the item's description of it. Read its diff against the branch it lands on: `$INPUTS.land_on`, or the project's base branch when that is empty. Then read what calls the changed code and what the changed code relies on: the diff alone does not show who depends on it.

`involved` does not mean the change touches an error shape, a type or a schema file. It means a wrong version would not be caught by reading the diff, because the change alters how separate parts agree: a contract that other code implements or consumes, shared state, ordering, or security. A change inside one part that its callers do not notice is not involved, however many lines it has.
