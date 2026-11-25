# Are the checks green at the new head?

A change that was approved fell behind the branch it lands on, and its builder brought it up to date. Nothing else in it changed: that has been compared. You find out one thing: whether the host's checks pass at the new head, and whether the host now says it merges. You change nothing, on the host or in the checkout.

The change: $INPUTS.change

Use `archon forge` to read the host; run `archon forge --help` once to see what it offers. Read the change's head commit, its checks at that commit, and whether it merges with the branch it targets.

Checks take time. When some are still running, wait a few minutes and look again. Look at one or two changes this project merged recently to see which checks a change usually gets, so you do not call it green before they have all started. Give up after about thirty minutes and say what you were still waiting for.

Reviews and review comments are not yours to read here: the host round read them before the change was approved, and the change has not changed since.

- **green**: every check the host runs on a change finished at the head commit and passed, or was skipped by the project's own design.
- **red**: one failed. Say which, in your summary.
- **waiting**: you gave up waiting.
