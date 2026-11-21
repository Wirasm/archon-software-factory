# archon-software-factory

A software factory that runs on [Archon](https://github.com/coleam00/Archon): it takes work items from a forge, turns each into a merged change, and asks a person only when a decision is theirs.

**Status: early, and it runs.** It has delivered real changes to Archon since 2026-11-13: triage, plan, build, three checks, a verdict and a read of the project's own CI, with asks where a decision belongs to an operator, and an answer that starts the next stage. On the three-stage shape it merges a ready change when the project's land policy or an operator says so. Nothing enters on its own. See [what is not there yet](#what-is-not-there-yet).

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

You need Archon from its `dev` branch, a checkout of your project, the database store (the default), and a forge plugin for the project's host. The first work order registers the project with Archon; there is no separate step. This checks the plugin and its credential for what the pack's scripts and its land and drain stages call:

```bash
archon forge check --data '{"repo":"github.com/<owner>/<name>","operations":["pr.view","pr.review.submit","pr.merge-state","pr.merge","workitem.view","workitem.comments","workitem.comment.upsert","workitem.create"]}'
```

The commands below are written for a POSIX shell.

**1. Install the pack, and update it the same way later.**

```bash
archon plugin add Wirasm/archon-software-factory
archon plugin update Wirasm/archon-software-factory
```

**2. Write the pack's trigger files for your repository and register them.** The pack declares the starts between its stages; this turns them into files for one repository. `archon trigger whoami` prints your user id.

```bash
archon pack bindings Wirasm.archon-software-factory \
  --repo github.com/<owner>/<name> --host <host-id> --run-as <user-id> \
  --cwd <path to the checkout> --out <a directory you choose>
archon trigger add <each file the command printed, except the order file>
archon trigger check
```

The order file is the one you fire by hand in step 3; it is not registered. Run the same three commands again after a pack update, because an update can add or change a start.

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
  --config <that directory>/<the order file> --inputs order.json
```

The order becomes a work item, and the engine starts each next stage when the one before ends: triage, the split when triage calls for one, plan, deliver, the land gate, and on the three-stage shape the land stage, the landed check and the discoveries drain. `archon workflow runs --item issue-123` shows where it is. For a few seconds after a stage ends, the next one reads as admitted and not started; it starts by itself.

**4. Answer what it asks.** A stage that needs a decision ends and leaves an ask with options and a recommendation.

```bash
archon workflow attention
archon workflow answer --ref <ask ref> --choose <option id> --text "why"
```

The answer starts what comes next, and what you wrote reaches that run as a decision already made. An ask from plan starts plan again. An ask from the land gate or the land stage offers `land`, `send-back` and `hold`. An ask from delivery offers four options, and the one you choose decides:

| Option | What starts |
|---|---|
| `send-back` | Delivery, in the checkout it left, with the same builder. |
| `replan` | Plan, then delivery. |
| `take-as-is` | Nothing. The change stands; you land it or close it. |
| `hold` | Nothing, until you say more. |

**5. Read the report.** Delivery keeps one report on the pull request and replaces it after every round: the rounds, what is still to change, what the item asks for and how each was checked, and how the run ended.

**Review someone else's pull request.** This reads the pull request's own description as the item and posts the same kind of report.

```bash
archon workflow run inspect --input change=https://github.com/<owner>/<name>/pull/45
```

**Tell it how your project works.** Put a settings file in the project at `.archon/packs/Wirasm.archon-software-factory.yaml`, commit it (a run reads it from its own checkout), and point it at your own policy files; [`.pack/pack.yaml`](.pack/pack.yaml) lists every setting. Archon's own are in its repository under `.archon/factory/policy/`.

## Items that are not one change

Triage ends `narrow` when part of an item should not be built: the smaller part is planned and the rest is dropped. It ends `split` when all of the item is worth building, but not as one change: an epic, a PRD, a bundle of tasks, or parts that must land apart. That starts the split stage, which reads the project and decides by the item's kind, held to [`policy/split.md`](policy/split.md) and the project's own `split_policy`. A piece is cut off only when it cannot be part of the same change. A run ends one of three ways:

| Outcome | What starts |
|---|---|
| `whole` | Plan, on the item as it is. |
| `split` | Each member that starts now becomes a work item of its own, with the key `<item key>-<member id>`, recorded as part of the item. It goes through order and triage like any other item. |
| `waiting` | Nothing. Every member waits on a ruling or a signal. |

A member that starts later has no brief yet. It stays in the run's result with what it waits on (`archon workflow get <run-id> --json`). A ruling it waits on is an ask on the item, and answering it starts the split again, which starts the member. Nothing watches a signal or a member landing: start the split again when it has happened.

To split an epic or a PRD without triage, start the stage on its item. With the bindings registered, its outcome starts what the table says.

```bash
archon workflow run split --item <key> --input-file item=<the item's text>
```

## Delivery as three stages (trial)

`deliver` is one run, so an answer on its ask can only start the whole delivery again. On trial beside it: `stage-build`, `stage-check` and `stage-host`, each a run of its own on the item, started by the pack's bindings. A check that returns the change starts the builder in the session it last had on the item; an approval starts the host round; and an answer starts only the stage its option names (`send-back`, `one-more-round`, `replan`, `take-as-is`, `hold`).

An item is allowed three check rounds. When a check would return the change with the rounds used up, it ends in an ask, and `one-more-round` allows the item one more. When the rounds are used up, the same judgment as in `deliver` recommends one of the options. Each check run leaves the report on the pull request, as `deliver` does after each round, and the host stage closes it. Each check run's result says which round it was and how many the item is allowed (`archon workflow get <run-id> --json`, under `terminal_record.returns.value`).

Both shapes are declared. A repository takes one at the hand-off from plan: register `deliver-after-plan` or `stage-build-after-plan`, not both. Write the files of the new shape with `--only`, naming every binding in [`.pack/pack.yaml`](.pack/pack.yaml) below the "Delivery as three stages" comment, and add each. To try a single item on the new shape while the repository stays on `deliver`, leave `stage-build-after-plan` unregistered. The item's `deliver` run still starts when it is planned: cancel it, or withdraw its start while it is queued, then start the build by hand. Every later stage on the item is started by the bindings.

```bash
archon workflow run stage-build --item <key> --input-file item=<the item's text>
```

## What is not there yet

- **It merges only on the three-stage shape, and only what was allowed.** After a ready change the land gate decides: it ends `land` when the project's land policy lets the change land by itself, and asks otherwise, always when the project names no land policy. The land stage then merges the change into its landing branch through the forge, when it still merges and the host's checks at its head are green; a change that does not goes back to its builder. Not there yet: `take-as-is` on a host ask still starts nothing, a land return on an item built by `deliver` continues on the three stages and has not been tried, and landing is not waited for by anything that depends on the item.
- **Nothing enters on its own.** Every item starts with a work order. A standing intake is being tried as a shadow.
- **Admit is recorded, not acted on.** Triage records whether an item could have started without asking; nothing uses it yet.
- **The drain files at most three items a run.** The discoveries drain decides what should become a work item. When the project has a tracker it creates the three most valuable there, and holds the rest; its result says where each was filed. With no tracker it writes nothing and an operator files them. On the three-stage shape it starts when the change has landed; on `deliver` it still starts at `ready`.
- **A split starts its first members and nothing after them.** A member that waits on a signal, or on another member landing, starts only when the split runs again, by an answer or by hand. The members' landing branch reaches them as `land_on`; the split does not create the branch or record it on the item.
- **Changes built side by side can conflict.** A change that was ready stops merging when a sibling lands first. Nothing brings it up to date yet.
- **The landing branch is enforced at the merge, not before it.** `land_on` reaches every stage, and the land stage merges only a change proposed against it: one proposed against another branch stops with an ask. Not enforced: the engine still cuts the first worktree from the base branch, and nothing makes the builder propose against `land_on`. The land stage records the branch on the item after the merge, so later work on the item is cut from it.
- **No screenshots in the report.** The forge has no way to attach a file.

## License

MIT

## Policy

What a stage holds a change to is not in its prompt. Each stage reads the pack's default in [`policy/`](policy/) first, then the project's own file when the project names one, and the project's line wins where they differ. The defaults are short on purpose: a project with no policy of its own is held to its own guidance. A project names its files, and the command that proves a change, in `.archon/packs/Wirasm.archon-software-factory.yaml` under `settings:` (see [`.pack/pack.yaml`](.pack/pack.yaml)).
