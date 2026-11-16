# Review eval: Archon cases

Real changes to `coleam00/Archon` built by this pack on 2026-11-15 and 16. Each case is a commit that the pack's own review, test check and product review had approved or passed on, with the defect that was found afterwards by the project's CI, by an outside review, or by a later check. They are the cases our own checks missed, which is what makes them worth keeping.

- `items/`: the issue as the item file each stage was given.
- `builds/`: the diff of the commit against its base. `key.json` names both commits for each case.
- `key.json`: what a reviewer should conclude, the evidence, and how the verdict was established (`ran`: someone ran it and saw it fail; `read`: established by reading the code, not yet by a failing run).

A reviewer is scored as in the jelly set: it returns the change and names this defect, not another one. Three kinds of case are in here on purpose:

- A defect a reviewer could find by thinking about the change (5739-A, 5688-A, 5708-A, 5745-B).
- A defect only the project's own checks show (5738-A, 5745-A). A reviewer that reads the diff cannot see these; one that asks "what in the project would catch a mistake here, and was it run" can.
- A docs defect in a change whose code is right (5734-A).

## Still to add

Cases with a known verdict that are not in the set yet:

- Clean approvals, so a reviewer that returns everything does not score well: 5740 (merged as PR 5750, no finding from CI or outside review) once the blind judge has confirmed it.
- Test-check cases, which need their own key: 5684 at `75dec2478` (six findings, four held when checked), 5739 at `e15796152` (three findings that then cost three rounds; a later prompt called the same commit sound), 5738 at `07c570600` (one finding, judged worth a round).
- A verdict case: 5688 after its first round, where the right outcome was an ask (three undecided design questions) and the stage said return three times.
- A triage case: issue 5704, where the right call was to park it because its premise was false on dev.
- From the bundled SDLC pack's runs the same day: a fixer on a fresh context that broke something the first build had right, twice (issue 5754, run `8e395fb3`), and an outside review finding after "ready" (issue 5737, PR 5776). The commits are in that pack's ledger.
- Whatever the blind judges of 30 merged changes (15 from each pack, 2026-11-16) find that nobody had seen.
