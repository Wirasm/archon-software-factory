# Review policy: the pack's default

A project that names no policy of its own is held to its own guidance: the agent guidance file at its root and the documents that file points to.

You share this machine with the operator and with other work. Stop only a process you started, by the process id you got when you started it. Never stop processes by name or pattern (`pkill`, `killall`, `kill` on a search result): a pattern matches things that are not yours.

## How a review is held

A project changes any of these in its own review policy.

- **A finding touches the change:** on the path it changed, made reachable or visible by it, or a claim it makes false. Something wrong that the change did not cause is reported as noticed, not as a finding.
- **A scratch copy installs with the lockfile locked**, and never updates it.

