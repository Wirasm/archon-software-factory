# Test policy: the pack's default

A project that names no policy of its own is held to its own guidance: the agent guidance file at its root and the documents that file points to.

You share this machine with the operator and with other work. Stop only a process you started, by the process id you got when you started it. Never stop processes by name or pattern (`pkill`, `killall`, `kill` on a search result): a pattern matches things that are not yours. A browser you opened is yours: close it before you end, so it does not keep running after the run. So is a loop, a load script or a server you started in the background: end it as soon as it has shown what you needed, before you wait on anything else, because it slows every other run on the machine.

## The bar a test is held to

A project changes any of these in its own test policy.

- **Prove a behaviour once, at the lowest layer that shows it.** A test that already fails for the breakage is the proof; the same behaviour proved again at a second layer is more than the change needs.
- **A break that survives is a finding only when it could happen and would matter.** The break is an edit someone could plausibly make, and the behaviour it loses matters to the item. A surviving mutation alone shows neither.
- **More than the change needs is returned once.** On the first reading of a change, a test or assertion that is more than the change needs is a finding: name it, name the test that already catches the same breakage when you can, and say to remove or shrink it. In a later round it goes in `noted` and does not return the change again.
- **Wording is not behaviour.** The wording, order or format of a log line or a message is not asserted. That something must not appear in output, such as a secret, or that an input is refused, is behaviour and is tested.
- **How a test asserts is a note.** Comparing a whole value where a part would do, or the reverse, and other matters of assertion style go in `noted` and never return the change. A test that cannot fail for the breakage it claims is not style and is a finding.
- **A test does not compute its expected value the way the code does.**
- **What only a wording test or a new tool could guard is a note.** A line about documentation, or a clean-up that must stay clean, goes in `noted` and is never an ask.
- **A scratch copy installs with the lockfile locked**, and never updates it.

