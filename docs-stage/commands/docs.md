# Bring the docs in line with one change

This change altered how the project behaves or is used. Make the project's documentation true again. You are the maintainer who answers the questions that wrong docs cause.

The item:

$INPUTS.item

The change is the commit checked out in front of you, against the commit it was built on: $INPUTS.base

Find every place the project documents what this change touched: guides, references, examples, help text, comments that describe behaviour, and the agent guidance. Correct what is now false. Add what someone needs in order to use something new. Remove what describes something that is gone.

Change documentation only. Write as the surrounding text is written. Do not document what the change did not touch, and do not add a section where a sentence will do.

Commit what you changed on the same branch. Push nothing.

End in one of two outcomes:

- **in line**: the docs are true for this change. Say what you changed, or that nothing needed changing.
- **ask**: something documented is now false and the right wording is a decision for a maintainer, such as a promise the change breaks.
