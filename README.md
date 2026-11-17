# archon-software-factory

A software factory that runs on [Archon](https://github.com/coleam00/Archon): it takes work items from a forge, turns each into a merged change, and asks a person only when a decision is theirs.

**Status: early, and it runs.** It has delivered real changes to Archon since 2026-11-13: triage, plan, build, three checks, a verdict and a read of the project's own CI, with asks where a decision belongs to a person. It does not merge yet, and nothing enters on its own. See [what is not there yet](#what-is-not-there-yet).

## What it is for

Someone installs Archon, points it at their forge and their CI, and work flows from where it starts to merged code. They choose where people step in. Anything that is not the core plugs in at a seam.

## How it is built

- **Delivery is the core.** One item in; out comes a change with its evidence, a decision someone else must make, or a clean stop with the reason. Never silence.
- **The engine moves the work.** A stage finishes and the engine starts the next one. The pack has no hand-off scripts.
- **Asks are items too.** Any stage can leave an ask: the context, the options with their tradeoffs, and a recommendation. A person or an agent answers it, and the answer starts the stage again.
- **A stage does not wait mid-run for a person.** It finishes and leaves its asks.
- **Prompts first.** Each stage is a short command file that states the goal and the outcome. A script exists only where a measured failure asked for one.
- **Measured on real work.** A change to the factory is judged on the items it delivers, not on tests of its own scripts.

## Run it

You need Archon from its `dev` branch, a project registered with Archon, the database store (the default), and a forge plugin for the project's host (`archon forge check`).

**1. Install the pack, and update it the same way later.**

```bash
archon plugin add Wirasm/archon-software-factory
archon plugin update Wirasm/archon-software-factory
```

**2. Write the pack's trigger files for your repository and register them.** The pack declares the starts between its stages; this turns them into files for one repository. `archon trigger whoami` prints your user id.

```bash
archon pack bindings Wirasm.archon-software-factory \
  --repo github.com/<owner>/<name> --host <host-id> --run-as <user-id> \
  --cwd <path to the checkout> --out ~/.archon/bindings/factory
archon trigger add <each file the command printed>
archon trigger check
```

`<host-id>` is a name you choose for the machine that runs the work. Pass the same name as `ARCHON_TRIGGER_HOST` when you start an item.

**3. Start an item with a work order.** A work order is a small JSON file. Only `key` and one of `source` or `text` are needed.

```json
{
  "key": "issue-123",
  "source": "https://github.com/<owner>/<name>/issues/123",
  "text": "Anything you want to add to what the issue says.",
  "land_on": "",
  "part_of": ""
}
```

```bash
ARCHON_TRIGGER_HOST=<host-id> archon trigger fire \
  --config ~/.archon/bindings/factory/<the order file> --inputs order.json
```

The order becomes a work item, and the engine starts each next stage when the one before ends: triage, plan, deliver, then the land gate and the discoveries drain. `archon workflow runs --item issue-123` shows where it is.

**4. Answer what it asks.** A stage that needs a decision ends and leaves an ask with options and a recommendation.

```bash
archon workflow attention
archon workflow answer --ref <ask ref> --choose <option id> --text "why"
```

An answer does not restart the stage yet (see below). After you answer, start the item again with a work order whose `text` says what you decided; the stages read that as a decision already made.

**5. Read the report.** Delivery keeps one report on the pull request and replaces it after every round: the rounds, what is still to change, what the item asks for and how each was checked, and how the run ended.

**Review someone else's pull request.** This reads the pull request's own description as the item and posts the same kind of report.

```bash
archon workflow run inspect --input change=https://github.com/<owner>/<name>/pull/45
```

**Tell it how your project works.** Put a settings file in the project at `.archon/packs/Wirasm.archon-software-factory.yaml` and point it at your own policy files; [`.pack/pack.yaml`](.pack/pack.yaml) lists every setting. Archon's own are in its repository under `.archon/factory/policy/`.

## What is not there yet

- **It does not merge.** The land gate runs after a ready change and records what it would do. A person merges.
- **Nothing enters on its own.** Every item starts with a work order. A standing intake is being tried as a shadow.
- **Admit is recorded, not acted on.** Triage records whether an item could have started without asking; nothing uses it yet.
- **An answer does not restart the stage.** The engine can start a stage when its asks are answered, but a pack cannot declare that start yet, and a delivery restarted that way would not continue in the checkout it left. Both wait on one engine change.
- **The landing branch is carried, not enforced.** `land_on` reaches the builder and the checks, but the engine still cuts the worktree from the base branch.
- **No screenshots in the report.** The forge has no way to attach a file.

## License

MIT

## Policy

What a stage holds a change to is not in its prompt. Each stage reads the pack's default in [`policy/`](policy/) first, then the project's own file when the project names one, and the project's line wins where they differ. The defaults are short on purpose: a project with no policy of its own is held to its own guidance. A project names its files, and the command that proves a change, in `.archon/packs/Wirasm.archon-software-factory.yaml` under `settings:` (see [`.pack/pack.yaml`](.pack/pack.yaml)).
