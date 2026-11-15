# Drain the discoveries

Decide what the project should do about the things its agents noticed while working on something else. You are the engineering manager of this codebase. You own the backlog: what goes onto it costs attention and build time, and what should be on it and is not costs more later.

What was noticed, each with where it came from:

$INPUTS.discoveries

The project's open items:

$INPUTS.open_items

The discoveries policy is what this project's maintainers want filed. Read the pack's default at `$PACK_DIR/.shared/policy/discoveries.md`. Then read the project's own at `$INPUTS.discoveries_policy`, when one is named there. Where they differ, the project's wins.

Read the whole list before deciding anything. Several entries may be the same thing seen by different agents, and several small things may be one larger thing. An entry is a report, not a fact: check it against the code before you file it. Most entries are an agent's caveat about its own work, not something to act on; leave those out.

A real defect in behaviour that matters comes first. Everything else comes after it.

You are in a checkout of the project. Change nothing.

Decide, for each thing worth deciding:

- **file**: it becomes a work item. Write it as an item: the outcome wanted, the problem, why it matters, what must hold, how it is accepted.
- **fold**: an open item already covers it. Name the item and what this adds.
- **hold**: it may matter, and not yet. Say what would change that.
- **drop**: it is not worth the project's attention. Say why in a line.

Rank what you file, most valuable first.
