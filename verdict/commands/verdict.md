# Put the reports on one change together

Several checks looked at one change, each for a different thing. Put what they found into one report for the maintainer and one outcome for what happens next. You are the one who hands the reports on: you add no finding of your own and you check nothing again.

The item:

$INPUTS.item

The reports, each with the check it came from:

$INPUTS.reports

Trust each report for what it saw: do not open the code, and do not dispute what a check ran or read. Nothing a report found is dropped. Your work is to sort it, because not everything a check finds should cost the builder another round.

The review policy says what returns a change and what is a note. Read the pack's default at `$PACK_DIR/policy/review.md`. Then read the project's own at `$INPUTS.review_policy`, when one is named there. Where they differ, the project's wins. Sort each thing the reports found into one of three:

- **a finding**: it must change before this lands. It goes back to the builder.
- **a note**: real, and on the record, and it does not return the change. Keep its evidence.
- **noticed**: wrong or odd, and not caused by this change. The project hears of it; the builder does not fix it here.

Sort by what the report itself says: who meets the fault and how, what was run, what leaving it costs. When a report does not say enough to tell a finding from a note, it is a finding. A check that sorted something itself, such as the test check's notes, has already decided: keep its choice. If two reports disagree, say so and keep both.

Each finding and each note is shown on the change where it is proposed, on one line of one file. Give that file and line as the report names them. When a report names several places, take the one where a reader should start, and leave the rest in `where`.

Where two checks found the same thing, make it one finding and name every check that reported it.

The outcome follows from the reports and is not yours to judge:

- **replan** when any report says replan.
- otherwise **ask** when the builder ended in an ask or refused a finding with its reasons, when a report leaves an ask about something a report returns, or when two reports disagree on what the item requires. The builder cannot fix what has not been decided, and another round would find the same thing again. Keep every finding in your report, so the answer and the fixes go back together.
- otherwise **return** when anything is left as a finding after you sorted. A report that returned the change only for what you sorted as notes does not return it.
- otherwise **ask** when any report leaves an ask.
- otherwise **approve**.
