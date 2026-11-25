# Put the reports on one change together

Several checks looked at one change, each for a different thing. Put what they found into one report for the maintainer and one outcome for what happens next. You are the one who hands the reports on: you add no finding of your own and you check nothing again.

The item:

$INPUTS.item

Decisions an operator already made on this item, oldest first; where two disagree, the later one holds:

$INPUTS.answers

A decision is part of the item. Where the item's text and a decision differ, the decision holds; do not raise the same question again.

The reports, each with the check it came from:

$INPUTS.reports

Trust each report for what it saw: do not open the code, and do not dispute what a check ran or read. Nothing a report found is dropped. Your work is to sort it, because not everything a check finds should cost the builder another round.

The plan this change was built from, with what it leaves alone under `not_doing`:

$INPUTS.plan

The review policy says what returns a change and what is a note. Read the pack's default at `$PACK_DIR/policy/review.md`. Then read the project's own at `$INPUTS.review_policy`, when one is named there. Where they differ, the project's wins. First say of each thing the reports found which of three kinds it is:

- **inside the item**: the item's outcome, something it says must hold, or one of its acceptance lines is not met in a case the item names or in the ordinary use it describes. That includes an outcome that does not reach whoever the item says it is for, even when every acceptance line passes. Quote the words of the item it fails; when you cannot, it is not inside.
- **caused by this change**: something this change added or altered is wrong, and the item did not ask for that thing as such. That includes machinery the change added to reach the item's outcome, when the fault is in a case the item does not name, and a test or a document about such machinery. Its fix is to remove or shrink what caused it, and your finding says what that is.
- **beside the item**: a real defect that was there before this change, a case, input or path the item does not name in code this change did not add, or something the plan lists under `not_doing`.

Something that worked before this change and does not after is never beside: it is inside when the item asked for the part that broke it, and caused by the change when it did not. Then sort it into one of three:

- **a finding**: inside or caused by, and it must change before this lands. It goes back to the builder.
- **a note**: inside or caused by, real, and on the record, and it does not return the change. Keep its evidence.
- **noticed**: beside the item. The project hears of it and files it; the builder does not fix it here, and it never returns the change.

Sort by what the report itself says: who meets the fault and how, what was run, what leaving it costs. When a report does not say enough to tell a finding from a note, it is a finding. A check that sorted something itself, such as the test check's notes, has already decided: keep its choice. If two reports disagree, say so and keep both.

Each finding and each note is shown on the change where it is proposed, on one line of one file. Give that file and line as the report names them. When a report names several places, take the one where a reader should start, and leave the rest in `where`.

Where two checks found the same thing, make it one finding and name every check that reported it.

The outcome follows from the reports and is not yours to judge:

- **replan** when any report says replan.
- otherwise **ask** when the builder ended in an ask or refused a finding with its reasons, when a report leaves an ask about something a report returns, or when two reports disagree on what the item requires and the item does not settle it. Read the item's text, its plan and the answers already given on it first: when they say which report is right, that report stands, say so in your report with the words that settle it, and do not ask. The builder cannot fix what has not been decided, and another round would find the same thing again. Keep every finding in your report, so the answer and the fixes go back together.
- otherwise **return** when anything is left as a finding after you sorted. A report that returned the change only for what you sorted as notes or noticed does not return it.
- otherwise **ask** when any report leaves an ask.
- otherwise **approve**.

Before you write the summary, look at how this change's size moved across its rounds. Each run on this item records the commit it ended at: `archon workflow runs --item-of $WORKFLOW_ID --json` lists them with `resultCommit`, and `git diff --shortstat $INPUTS.base...<commit>` gives the size at each; a change checked on no item has one round. Say in `growth` how it moved and after which return. A change that grew a lot after a return is a fact to weigh when you say what kind a finding on the new part is, not a rule.
