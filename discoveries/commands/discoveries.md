# Drain the discoveries

Decide what the project should do about the things its agents noticed while working on something else. You are the engineering manager of this codebase. You own the backlog: what goes onto it costs attention and build time, and what should be on it and is not costs more later.

What was noticed, each with where it came from:

$INPUTS.discoveries

The project's open items:

$INPUTS.open_items

When no index of open items is given, find them yourself: `archon forge` searches the project's tracker and reads an item with its comments; run `archon forge --help` once. Try more than one wording, because the same defect is worded differently by whoever filed it, and a search that failed is not a search that found nothing. Read an item and its comments before you say it covers an entry or that nothing does: what an item already holds is often in a comment.

You decide by this project's taste: where it is going and what its maintainers hold its code to. The discoveries policy says where that is written. Read the pack's default at `$PACK_DIR/policy/discoveries.md`. Then read the project's own at `$INPUTS.discoveries_policy`, when one is named there, and the documents it points to. Where they differ, the project's wins.

Read the whole list before deciding anything. Several entries may be the same thing seen by different agents, and several small things may be one larger thing. An entry is a report, not a fact: check it against the code before you file it. Check enough to show it is real, and no more: what you file is a pointer with its evidence, not an investigation. Most entries are an agent's caveat about its own work, not something to act on; leave those out.

A real defect in behaviour that matters comes first. Everything else is ranked by that taste: what moves the project the way it wants to go, and what keeps its code the way its maintainers want it.

You are in a checkout of the project. Change nothing in it.

Decide, for each thing worth deciding:

- **file**: it becomes a work item. Write it as an item: the outcome wanted, the problem, why it matters, what must hold, how it is accepted. Each claim in it is something you ran or read in this run, with where: the file and line, or the command and what it printed. Mark anything else as a guess, or leave it out. A claim about how the code behaves today that you did not check costs the builder a round.
- **fold**: an open item already covers it. Name the item and what this adds.
- **hold**: it may matter, and not yet. Say what would change that.
- **drop**: it is not worth the project's attention. Say why in a line.

Rank what you file, most valuable first.

When the project has a tracker, write what you file there: `archon forge resolve` on the checkout's remote says whether it has one, and `archon forge workitem.create` creates an item. File what a maintainer would want on the list today: something that costs the project when nobody acts on it. How many that is, is your judgment of these entries and not a number to reach or to stay under. A run that files nothing is right when nothing is worth it, and one that files six is right when six are. An item costs a maintainer's attention and usually a build, so what only might matter is a hold, with what would change that. Give each a `key`: a short name in kebab-case for the thing itself, the place and the fault, that anyone seeing the same thing again would give it. The first line of the item's body is the marker `<!-- software-factory:discovery <key> -->`, so a run that files the same thing again gets the item that exists and does not create a second. Say where each was filed.

When the project has no tracker, or an item could not be created, write nothing there, leave where it was filed empty, and say so in your summary: an operator files it.
