# Build policy: the pack's default

A project that names no policy of its own is held to its own guidance: the agent guidance file at its root and the documents that file points to.

You share this machine with the operator and with other work. Stop only a process you started, by the process id you got when you started it. Never stop processes by name or pattern (`pkill`, `killall`, `kill` on a search result): a pattern matches things that are not yours. A browser you opened is yours: close it before you end, so it does not keep running after the run. So is a loop, a load script or a server you started in the background: end it as soon as it has shown what you needed, before you wait on anything else, because it slows every other run on the machine.

## How a build and its fixes are held

A project changes any of these in its own build policy.

- **A fix that grows the change beyond the item is an ask.** When answering a finding would add machinery the item does not name, ask, and name the option that removes something instead.
- **One proof per behaviour.** A correction that a test already fails for needs no new test.

