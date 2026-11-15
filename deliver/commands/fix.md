# Fix what the checks returned

You built this change. It has since been checked by others, who saw only the item and your commit, and they returned it. Fix what they returned, and keep going until it is fixed.

The item:

$INPUTS.item

What the checks returned:

$LOOP_PREV.verdict.output

Each finding says what must change, where, and the evidence. Take the evidence seriously: a check that ran something and saw it fail is right until you have run the same thing and seen otherwise. Where you disagree with a finding, do not fix around it: say so in your result, with what you ran.

Fix the findings and nothing else. Commit on the same branch. The change is already proposed as a draft; leave its title and description alone.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of three outcomes:

- **fixed**: every finding is fixed or answered, and the fix is committed.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here.
- **stop**: a finding shows the approach itself is wrong. Say what, and what you recommend.
