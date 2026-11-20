# Review policy: the pack's default

A project that names no policy of its own is held to its own guidance: the agent guidance file at its root and the documents that file points to.

You share this machine with the operator and with other work. Stop only a process you started, by the process id you got when you started it. Never stop processes by name or pattern (`pkill`, `killall`, `kill` on a search result): a pattern matches things that are not yours.

## How a review is held

A project changes any of these in its own review policy.

- **A finding touches the change:** on the path it changed, made reachable or visible by it, or a claim it makes false. Something wrong that the change did not cause is reported as noticed, not as a finding.
- **What returns a change.** Behaviour that is wrong in ordinary use: say who does what and what goes wrong. A document, comment or claim the change makes untrue. Something the item asks for that the change does not do, or that would break unnoticed. Machinery the change adds that nothing in the item asks for and no failure in ordinary use needs: say what to remove. These return the change in any round, wherever they sit.
- **What is a note.** A guard the change does not have, against an input, state or setting nobody realistically reaches, or behind one that already holds. A test the test check sorted as a note. Wording and naming. A different shape that behaves the same. A note is written down with the finding's evidence and never returns the change.
- **What a review runs.** The tests of the packages the change touches, and what it needs to show a finding. The rest of the suite is the host's to run on the proposed change; a review does not run whole suites in scratch copies of the base and the change.
- **A scratch copy installs with the lockfile locked**, and never updates it.

