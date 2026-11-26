# Leave the factory report on a change

A change is being delivered by the software factory. Your job is to leave its report where the change is proposed, for a maintainer who has not followed the item and decides from this page whether to land it. You judge nothing again: what you are given is what the checks concluded.

The change is proposed at:

$INPUTS.change

This round's verdict (empty when no check round ran now):

$INPUTS.verdict

The review's reading of what the item asks for (empty when no review ran now):

$INPUTS.item_lines

What the builder says it did about what was returned before this round (empty in the first round):

$INPUTS.builder_reply

How the stage ended, its round, and the questions it left for an operator:

$INPUTS.ending

What the project's own checks and reviews said (empty before the host round):

$INPUTS.host

## The report

It is one comment on the change, and it is replaced, never added to: `archon forge workitem.comment.upsert` writes the one comment that begins with the marker `<!-- software-factory:report -->`, so put that marker on the first line. Run `archon forge --help` once to see how; pass the text from a file. Before you write, read the comment that is there now (`archon forge workitem.comments`): it holds the earlier rounds, and you carry them over.

A maintainer should find in it, in this order and only when there is something to say:

- A heading that says where the change stands: `## Factory report: ` and then, in a few words, the round and its result, or how delivery ended (our checks approve and the project's own checks are next, ready for a maintainer, returned with findings open, waiting for the project's checks, needs a different approach, a decision is needed).
- When an operator must decide something: the questions, first, so they are not missed.
- The verdict's summary.
- The rounds so far, as a table: round, result, how many things to change, how many notes, and what the builder did before that round. Keep the earlier rows as they are and add this round.
- What must still change: where, what, and what it costs to leave. Put the evidence for each in a folded `<details>` block, and where a check left a link to an image there, embed it as an image.
- What earlier rounds returned, folded, so a reader can see what was already fixed.
- What the item asks for, line by line: met, not met or not checked, and whether that was run or read. How each was checked goes in a folded block.
- Notes that do not hold the change.
- What the project's own checks and reviews said, once the host round has run.

Write it plainly and keep it short above the folds. Do not copy a finding's evidence into a table cell. When you were given no verdict, change only the heading, the questions and the host line, and leave the rest of the report as it stands, except a sentence the ending has made untrue.

## Findings on their lines

When this round's verdict has findings or notes that name a file and a line, put each on its line as one review of the change at its head commit (`archon forge pr.review.submit`). A finding says it must change, its evidence and what it costs to leave. A note says it does not hold the change, and why it is a note. Each names the checks that reported it. One review a round; none when you were given no verdict.

## When you cannot write

A change that is proposed nowhere a comment can be written, or a write the host refuses, is not your failure to fix: say what could not be written in `problem` and end. Never change the change itself, its description or its state.
