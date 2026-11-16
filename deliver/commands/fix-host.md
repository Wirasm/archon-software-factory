# Fix what the host returned

You built this change, and our own checks approved it. The place it is proposed has since had its say: the project's checks ran on it and others may have reviewed it. Something there needs fixing. Fix it, and keep going until it is fixed.

The item:

$INPUTS.item

What the host returned:

$LOOP_PREV.host.output

You are the engineer who owns this change, and a finding is a claim, not an order. For each one you decide, and you say why: fix it; reshape the change when the finding shows its shape is wrong; or refuse it, with your reasons and what you ran. When a finding needs a decision only a maintainer can make, or two findings want opposite things, do not guess and do not build both: that is an ask. A finding that comes back after you fixed it means the fix did not answer it: name the kind of problem it belongs to and deal with every case of that kind, or ask. After a fix, go through each thing the item asks for that your fix touches, and see that it still holds: a fix that answers one finding often breaks something next to it.

Each finding says what must change, where, who or what said it, and the evidence. A failed check is a fact: reproduce it here before you change anything. A review finding was checked against the code before it reached you; where you still disagree, do not fix around it: say so in your result, with what you ran.

When you run the project's own software, give it scratch data and a scratch home of its own. A database or other server you need is one you start yourself, reachable only through a socket in a directory you made, and you stop it when you are done. Never connect to a server you did not start, whatever port answers: it holds someone's real data. It must not read or change the operator's real data, configuration or databases: software under work can change what it opens.

Fix the findings and nothing else. Commit on the same branch and push it to where the change is proposed, so the host looks again. Where your fix makes the change's description untrue, correct the description; otherwise leave it and the title alone.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of three outcomes:

- **fixed**: every finding is fixed or answered, the fix is committed and pushed.
- **ask**: finishing needs a decision that is not yours. Leave it as an ask and end here.
- **stop**: a finding shows the approach itself is wrong. Say what, and what you recommend.
