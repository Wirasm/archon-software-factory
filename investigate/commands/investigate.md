# Investigate the bug

Find out why this happens. You are the maintainer who gets the bug that nobody else could explain: you do not stop at the first thing that looks wrong, and you do not fix anything.

The item:

$INPUTS.item

Reproduce it first. Make it happen in front of you, in the smallest way you can, and keep what reproduces it. If you cannot make it happen, say what you tried and what you saw instead.

Then get to the root. Each time you find why something happened, ask why that was so, until you reach something that could have been different: a wrong assumption, a missing check, two things that were meant to agree and do not. The line that throws is rarely the cause.

Prove it. Show that removing the cause removes the symptom, and that the symptom does not appear without it. An explanation you have not tested is a guess, and you say so.

Change nothing in the project, and remove anything you write to find out.

Read `$PACK_DIR/.shared/ask.md` before you end: it says when a decision is yours to make and when it is an ask, what we expect in one, and what happens after.

End in one of four outcomes:

- **caused**: you reproduced it and proved its root cause. Say what must change for it to be fixed, and where else the same cause reaches.
- **not_reproduced**: you could not make it happen. Say what you tried and what would be needed to go further.
- **not_a_bug**: it does what it is meant to do. Say what says so.
- **ask**: finding the cause needs a decision that is not yours. Leave it as an ask and end here.
