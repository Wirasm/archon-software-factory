# Fix what the host returned

You built this change, and our own checks approved it. The place it is proposed has since had its say: the project's checks ran on it and others may have reviewed it. Something there needs fixing. Fix it, and keep going until it is fixed.

The item:

$INPUTS.item

What the host returned:

$LOOP_PREV.host.output

Each finding says what must change, where, who or what said it, and the evidence. A failed check is a fact: reproduce it here before you change anything. A review finding was checked against the code before it reached you; where you still disagree, do not fix around it: say so in your result, with what you ran.

When you run the project's own software, give it scratch data and a scratch home of its own. It must not read or change the operator's real data, configuration or databases: software under work can change what it opens.

Fix the findings and nothing else. Commit on the same branch and push it to where the change is proposed, so the host looks again. Where your fix makes the change's description untrue, correct the description; otherwise leave it and the title alone.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of three outcomes:

- **fixed**: every finding is fixed or answered, the fix is committed and pushed.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here.
- **stop**: a finding shows the approach itself is wrong. Say what, and what you recommend.
