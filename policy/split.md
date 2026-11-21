# Split policy: the pack's default

A project that names no policy of its own is held to its own guidance: the agent guidance file at its root and the documents that file points to.

## Whole unless a piece cannot be part of the same change

One run can plan and deliver a large change, and one change for one outcome is easier to check than several that only make sense together. An item is built whole unless a piece of it cannot be part of the same change, for a reason the item itself shows:

- the pieces are separate outcomes, each worth having on its own, so one change would mix things nobody can judge as one, and one piece stalling would hold back the rest;
- a piece must land and be used before a later piece can be built or judged, such as a measurement that must collect real data first, or a contract that must land before the work built on it;
- a piece waits on a ruling or a signal that the rest does not need;
- the work spans so many parts and surfaces, each with its own acceptance, that no single run could finish it and nobody could read it as one change.

Length, a long acceptance list, a large size, vagueness, and a title that says PRD or epic are not reasons. They are reasons to plan carefully. A piece that could be built in the same change is not a piece.

## What each kind is, and how it splits

A split breaks the item into the fewest pieces that each prove something on their own. Only what comes next starts; the rest is kept with what it waits on. Tell the kind by what the item asks for, not by its headings or its title.

- **PRD**: a release with a hypothesis. It says that shipping something will change something observable, and the work is how to find out. It is ready only when it states all three of: the hypothesis (if we ship this, what changes); the signal that proves or disproves it, with the command that measures that signal; and the threshold the signal must reach, with the window it is judged over. A command that does not exist yet is acceptable when the PRD says what it must print; the work then builds the measurement first. A PRD missing any of the three is asked for it, and the ask names the missing piece. The bar holds whether the PRD is split or built whole.
  It splits into phases, not tasks. A phase proves part of the PRD's outcome: usually a thin slice end to end, but it can be most of the thing, or all of it in one go. Only the current phase starts: the first one not yet done, unless it must wait on real use of what is already delivered. Each later phase is kept with the signal the earlier work must show before it starts.
  The verdict, judged on real use over the window after release, is never a piece. The PRD stays open for it either way, so it is never by itself a reason to split.
  A list of tasks under a PRD title, with no hypothesis, is not a PRD: it is an epic or a bundle, and is asked for its hypothesis when it was meant to be a PRD.
- **Epic**: one larger outcome. It splits into vertical increments, each leaving the product working and showing something an operator can observe. Never by layer or by file. Only the current increment starts.
- **Bundle**: separate tasks with no shared outcome. It is not sliced: each task starts as it is written, and none waits on another.
- **Parts**: one outcome, of which some parts must land apart, for a reason above. The part that can be built now starts; a part that waits is kept with what it waits on.
- **Whole**: one piece of work. Nothing is cut. A remainder that waits on a ruling is still named, with the ruling.

A piece that is already done, or that an open item already owns, is not cut again. An item that already has pieces started is not built whole: those pieces may be in flight, so the split stands and the next one is added to it.
