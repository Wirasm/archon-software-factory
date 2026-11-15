# Overrules

Every time the operator, or the agent acting for them, does something other than what a stage returned, it is written here: what the stage said, what was done instead, why, and which run said it. A stage's finding that was acted on as given is not an overrule and is not logged.

This is evidence for tuning a stage. A finding that keeps being overruled for the same reason is a sentence missing from that stage's prompt or policy, or a decision the stage should have asked about.

One entry per overrule in `log.md`, newest first. Each carries:

- **Item and change:** the issue, the pull request, the base and head the stage judged.
- **Run:** the stage, the run id, the model, the round, whether it was told what was returned before, time and tokens, and the hash of the stage prompt it ran on.
- **What the stage returned:** the finding, in its words.
- **What was done instead, and by whom.**
- **Why:** the reason, with what was run to check it.
- **Kind:** `scope` (right, but belongs to another change), `wrong` (the finding does not hold), `better fix` (the problem is real, a different fix was chosen), `policy` (a rule the project holds decides it), `taste`.
- **What it says about the stage:** the hypothesis, if there is one.
