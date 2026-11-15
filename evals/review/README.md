# Review eval

Real builds of seven issues from `Wirasm/jelly`, each with a verdict that was established by running things, not by reading.

- `items/`: each issue as an item file.
- `builds/`: one diff per build, against the commit named in `key.json`. The file name carries no model.
- `key.json`: for each build, what a reviewer should conclude (`approve`, `return` or `undecided`), the evidence for it in one or two sentences, which model built it and whether it built from a plan.

A reviewer is scored on two things: it returns the builds marked `return`, naming the defect in `why` and not something else; and it approves the builds marked `approve`. A reviewer that returns everything fails as surely as one that approves everything. `undecided` cases are not scored; they are here because reviewers disagreed on them and the disagreement is worth reading.

Every build here passed the project's own checks. That is the point of the set.

## Where the verdicts come from

Each build was applied to a private clone and judged by a reviewer that did not know which model made it. It ran the project's checks, wrote its own tests where a build could be wrong in a way its own tests miss, and drove a browser for the two issues that change a page. The verdicts were set on 2026-11-14 and 15.

## How a case is added

Add a case when a real run got something wrong, or right in a way worth keeping, and you can say why with evidence: a test that fails, a command and its output. Keep the item and the diff exactly as they were. Harder cases are worth more than more cases.

## First results (2026-11-15)

13 of these builds, each reviewer seeing only the item and the commit: Opus and Sonnet approved all 13, including all eight marked `return`. Sol, Terra and Haiku returned the seven flawed builds of issue 56 and named the defect. A default review policy made no measurable difference.
