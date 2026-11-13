# archon-software-factory

A software factory that runs on [Archon](https://github.com/coleam00/Archon): it takes work items from a forge, turns each into a merged change, and asks a person only when a decision is theirs.

**Status: early. Nothing here runs yet.** This repo starts from an empty base on purpose. It is the successor to the SDLC pack bundled with Archon, rebuilt from what that pack taught us.

## What it is for

Someone installs Archon, points it at their forge and their CI, and work flows from where it starts to merged code. They choose where people step in. Anything that is not the core plugs in at a seam.

## How it is built

- **Delivery is the core.** One item in; out comes a change with its evidence, a decision someone else must make, or a clean stop with the reason. Never silence.
- **The engine moves the work.** A stage finishes and the engine starts the next one. The pack has no hand-off scripts.
- **Asks are items too.** Any stage can leave an ask: the context, the options with their tradeoffs, and a recommendation. A person or an agent answers it, and the answer starts the stage again.
- **A stage does not wait mid-run for a person.** It finishes and leaves its asks.
- **Prompts first.** Each stage is a short command file that states the goal and the outcome. A script exists only where a measured failure asked for one.
- **Measured on real work.** A change to the factory is judged on the items it delivers, not on tests of its own scripts.

## Order of work

1. Triage, with asks, scored against a maintainer's own labels.
2. Deliver.
3. Land.

## License

MIT
