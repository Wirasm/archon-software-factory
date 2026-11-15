# Land one change

Land this change on its landing branch, and only as a tree that passes the project's check.

The item:

$INPUTS.item

The change, as build reported it:

$INPUTS.build

The landing branch: `$INPUTS.landing_branch`. When that is empty, it is the project's base branch.

The project's check, as its maintainers declared it:

$INPUTS.validate_command

You are in your own checkout of the project. Make the tree the landing branch would have after this change, and run the check on that tree, not on the change alone. When a check is declared above, run exactly that command; when none is, use the one the maintainers use and say which.

What must hold:

- The landing branch moves only to a tree you checked and that passed.
- It moves only from the commit you started from. If it moved while you worked, start again from where it is now.
- Never move a branch that is checked out in another working tree. If the landing branch is, stop and say so.
- Push nothing.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of four outcomes:

- **landed**: the landing branch now points at the checked tree.
- **returned**: the change does not land as it is, because it conflicts or the check fails on the combined tree. Say what a builder needs to know to fix it.
- **stop**: something outside the change prevents landing. Say what, and what you recommend.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here; nothing that follows your work starts until it is answered, and then this work runs again.
