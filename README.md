# archon-software-factory

A software factory that runs on [Archon](https://github.com/coleam00/Archon): it takes work items from a forge, turns each into a merged change, and asks an operator only when a decision is theirs.

An **operator** is whoever runs the factory: a person, or more often that person's coding agent. This README is written for both.

**Status: early, and it runs.** It has delivered real changes to Archon since 2026-11-13: triage, plan, build, three checks, a verdict and a read of the project's own CI, with asks where a decision belongs to an operator, and an answer that starts the next stage. It merges a ready change when the project's land policy or an operator says so. Nothing enters on its own. See [what is not there yet](#what-is-not-there-yet).

This README is the setup document. For running the factory day to day, [install the pack's skill](#install-the-skill) and let your agent read it.

## What it is for

Someone installs Archon, points it at their forge and their CI, and work flows from where it starts to merged code. They choose where an operator steps in. Anything that is not the core plugs in at a seam.

## How it is built

- **Delivery is the core.** One item in; out comes a change with its evidence, a decision someone else must make, or a clean stop with the reason. Never silence.
- **The engine moves the work.** A stage finishes and the engine starts the next one. The pack has no hand-off scripts.
- **Asks are items too.** Any stage can leave an ask: the context, the options with their tradeoffs, and a recommendation. A person or an agent answers it, and the answer starts the stage again.
- **A stage does not wait mid-run for an operator.** It finishes and leaves its asks.
- **Prompts first.** Each stage is a short command file that states the goal and the outcome. A script exists only where a measured failure asked for one.
- **Measured on real work.** A change to the factory is judged on the items it delivers, not on tests of its own scripts.

## Set it up

Do the six steps in order. Each command is one line, so it runs the same in a POSIX shell and in PowerShell. Text in `<angle brackets>` is yours to fill in.

On Windows, Archon recommends WSL2 for git worktrees and shell steps ([Archon on Windows](https://archon.diy/deployment/windows/)). Inside WSL2, follow the Linux notes below.

### 1. Check that Archon is installed

```bash
archon --version
```

- **It prints a version.** Go on. A source install also prints its git commit.
- **The command is not found.** Archon is a prerequisite and this pack never installs it. If you are an agent, stop and ask the person you act for before installing anything. The install instructions for macOS, Linux and Windows are at [archon.diy/getting-started/installation](https://archon.diy/getting-started/installation/). After installing, `archon doctor` lists the providers Archon can run.

The pack is developed against Archon's `dev` branch and uses engine commands that are recent: `archon pack bindings`, `archon trigger add`, `archon trigger check`, `archon hold` and `archon workflow wake schedule`. If Archon rejects one of them as unknown, the install is older than the pack needs. Update it ([updating Archon](https://archon.diy/getting-started/updating/)), or run Archon from a source checkout on `dev`.

Then check that Archon can run an agent:

```bash
archon doctor
```

It must pass before you order anything. On a new install it fails until a default provider is set: `archon ai default <provider>` (for example `claude`), after which the `small`, `medium` and `large` tiers have models. Without a default provider the first order is taken and the next stage is refused without a word in the item's read; `archon trigger list` shows the refusal.

You also need a git checkout of your project, and Archon's database store, which is the default.

### 2. Check forge access

The pack reads and writes issues and pull requests through Archon's forge plugin for the project's host. For GitHub, install the plugin (a source checkout of Archon already runs it from source):

```bash
archon plugin add coleam00/Archon/plugins/forge-github
```

Then check the plugin and its credential for what the pack's stages call. Save this as `forge-check.json`:

```json
{
  "repo": { "host": "github.com", "path": "<owner>/<name>" },
  "operations": [
    "pr.view", "pr.review.submit", "pr.merge-state", "pr.merge", "pr.close", "pr.draft",
    "workitem.view", "workitem.comments", "workitem.comment.upsert", "workitem.create"
  ]
}
```

```bash
archon forge check --data-file forge-check.json --json
```

It exits 0 and names the credential source it found, or exits 1 with the reason and, when you can fix it, a remedy. [Label intake](#label-intake-a-label-is-a-work-order) also needs `workitem.label.added`; add it to the list when you set that up.

### 3. Install the pack

```bash
archon plugin add Wirasm/archon-software-factory
```

`archon plugin list` shows it as `Wirasm/archon-software-factory`. In `archon pack bindings` and in the settings file name the pack is written with a dot, `Wirasm.archon-software-factory`, and its workflows run as `Wirasm/archon-software-factory:<stage>`, for example `Wirasm/archon-software-factory:inspect`.

### 4. Write the bindings for your repository and register them

The pack declares which stage starts when another ends or when its asks are answered. A declaration starts nothing. This step writes the declarations as trigger files for one repository and registers them.

```bash
archon trigger whoami
```

That prints your Archon user id. Then, from anywhere:

```bash
archon pack bindings Wirasm.archon-software-factory --repo github.com/<owner>/<name> --host <host-id> --run-as <user-id> --cwd <path to the checkout> --out <bindings-dir>
```

| Flag | What to give |
|---|---|
| `--repo` | The repository the factory works on, as `<host>/<owner>/<name>`. For a checkout with no remote, any name of that form works for text-only orders; stages that read or write the forge need the real one. |
| `--host` | A name you choose for the machine that runs the work, such as `build-mac`. Use the same name every time. |
| `--run-as` | The id `archon trigger whoami` printed. Runs act as this Archon user. |
| `--cwd` | The checkout runs launch in. It is written as an absolute path. |
| `--out` | A directory of your choice for the files. Keep it: you fire the order file from it. |

The command prints what it wrote in four groups. Act on each:

- **Run-ended bindings** and **asks-settled bindings**: register every one. The command prints an `archon trigger add '<file>'` line for each, about forty of them. Run those lines, or register them in one go: every generated file except the order file and the label file.

  ```bash
  for f in <bindings-dir>/*.json; do echo "$f" | grep -Eq -- '-order-(on-label-)?[0-9a-f]+\.json$' || archon trigger add "$f"; done
  ```

  PowerShell: `Get-ChildItem <bindings-dir>\*.json | Where-Object { $_.Name -notmatch '-order-(on-label-)?[0-9a-f]+\.json$' } | ForEach-Object { archon trigger add $_.FullName }`

  A file is active as soon as it is added.
- **Fire-only bindings**: one file, the order file (`...-order-<digest>.json`). Do not add it. You fire it by hand in step 5.
- **Event bindings**: one file, `...-order-on-label-<digest>.json`. Leave it unless you set up [label intake](#label-intake-a-label-is-a-work-order). The command's own output tells you to add it to a sources file and start a server; that is the label intake setup, and nothing else needs it.

Then check everything that is registered:

```bash
archon trigger check
```

It prints every binding as JSON and exits nonzero when one has a problem; a binding with a problem has a non-empty `problems` list, and exit 0 means there are none. Fix that before ordering anything: one invalid file in the triggers directory refuses item runs on the whole install.

To pass a [run config](#the-run-config-a-binding-launches-with) with your model aliases to every start, add `--config <file>` to the `pack bindings` command.

### 5. Order an item

A work order is a small JSON file. `key` and one of `source` or `text` are required.

```json
{
  "key": "issue-123",
  "source": "https://github.com/<owner>/<name>/issues/123",
  "text": "Anything you want to add to what the issue says.",
  "land_on": "",
  "part_of": ""
}
```

| Field | Meaning | Default |
|---|---|---|
| `key` | The item's key. Every run on the item is found by it. | Required. |
| `source` | A link to the item on the forge. Its title, body and comments become the item. | Empty: the work lives in no tracker. |
| `text` | The work as text. With a source, it is added below what the source says, as the operator's own words. | Empty. |
| `land_on` | The branch the change lands on. See [landing branch](#landing-branch-and-work-that-is-part-of-a-larger-item). | Empty: the project's base branch. |
| `part_of` | The key of the larger item this one is a piece of. | Empty: it stands alone. |
| `depends_on` | Keys of items that must land first, separated by commas. It is accepted and kept with the order. Nothing reads it or waits on it yet. | Empty. |

```bash
archon trigger fire --config <bindings-dir>/<the order file> --inputs order.json
```

The command returns as soon as the order is taken; the stages that follow run in the background. The first order registers the project with Archon; there is no separate step. The order becomes a work item, and the engine starts each next stage when the one before ends: triage, the split when triage calls for one, plan, build, check and host rounds, the land gate, the land stage, the landed check and the discoveries drain.

```bash
archon workflow runs --item issue-123
```

That shows where the item is: its runs with their outcomes, starts that wait, open asks and the answers given. Run it from the project's checkout. For a few seconds after a stage ends, the next one reads as admitted and not started; it starts by itself.

### 6. Answer what it asks, and read the report

A stage that needs a decision ends and leaves an ask with options and a recommendation.

```bash
archon workflow attention
archon workflow answer --ref <ask ref> --choose <option id> --text "why"
```

`archon workflow attention` lists the current project's asks, each with its ref (`ask:<id>`); add `--all` for the whole install.

The answer starts what comes next, and what you wrote reaches that run as a decision already made. Rule by answering: a run reads the item as it was ordered, so an edit or a comment on the issue after the order reaches no later stage. To keep an item waiting, leave its ask open and answer when you know. A stage that has no basis to choose leaves its ask without a recommendation and says in the ask's context why it cannot choose; it does not guess one.

Which options an ask offers depends on the stage that left it:

| Ask left by | Options |
|---|---|
| Plan, split | The stage's own options, written for that question. An answer starts the same stage again with the answer. |
| Build, check, host | `send-back`, `replan`, `take-as-is`, `drop`, `reshape`. When the item's check or host rounds are used up, `one-more-round` takes the place of `send-back`. |
| Land gate, land | `land`, `send-back`, `drop`, `reshape`. |

| Option | What starts |
|---|---|
| `send-back` | The builder, in the checkout it left, with your answer. Then the checks look at the change again. (After a build that was itself a host fix, the host round looks at it.) |
| `one-more-round` | The builder, with what was returned. The item is allowed one more round. After a check ask the checks run again; after a host ask the change goes straight back to the host round. |
| `replan` | Plan, then delivery. |
| `take-as-is` | After a build or check ask: the host round, on the change as it is. After a host ask: nothing. The change stands; you land it or close it. |
| `land` | The land stage, which merges the change when it still merges and its checks are green. |
| `drop` | The close step: the change is closed without merging, with your answer written on it. The item ends. |
| `reshape` | The close step: the change stays open as a draft, with your answer written on it. Nothing more is built until the item is shaped again. |

When a run left several asks, answer all of them: the next stage starts when the last one is answered. For build, check, host and landing asks it starts only when every answer chose the same option. `archon workflow answer` says so when a settlement starts nothing.

Delivery keeps one report on the pull request and replaces it after every round: the rounds, what is still to change, what the item asks for and how each was checked, and how the run ended. Findings that name a file and a line are also posted on those lines as one review per round.

## Install the skill

The pack ships a skill at [`skill/archon-software-factory/`](skill/archon-software-factory/SKILL.md) that teaches a coding agent to operate the factory: where every item is, what waits on an operator, ordering, answering asks, pausing, and what to check when a session starts. There is no installer yet. Copy the folder into the project your agent works in:

```bash
git clone https://github.com/Wirasm/archon-software-factory
mkdir -p <project>/.claude/skills <project>/.agents/skills
cp -R archon-software-factory/skill/archon-software-factory <project>/.claude/skills/
cp -R archon-software-factory/skill/archon-software-factory <project>/.agents/skills/
```

PowerShell:

```powershell
git clone https://github.com/Wirasm/archon-software-factory
Copy-Item -Recurse -Force archon-software-factory\skill\archon-software-factory <project>\.claude\skills\archon-software-factory
Copy-Item -Recurse -Force archon-software-factory\skill\archon-software-factory <project>\.agents\skills\archon-software-factory
```

Claude Code reads `.claude/skills/`; Codex reads `.agents/skills/`. Copy it again after a pack update. The skill builds on Archon's own `archon-cli` skill, which `archon skill add` installs into the same two folders.

## Optional settings

Everything in this section has a working default. Change a setting when its "change it when" line applies to you.

### Models: which model runs which role

**What it does.** No workflow in the pack names a provider or a model. Each agent node names a role as a model alias with a tier to fall back on, such as `['@builder', large]`. The first alias your config defines wins; an alias you do not define runs on the tier.

**Default.** No alias is defined, so every role runs on the `large`, `medium` or `small` tier of your Archon config.

**Change it when** you want a role on a specific model: a stronger planner, a reviewer from another provider than the builder, a cheaper judge.

| Alias | Role | Falls back to |
|---|---|---|
| `@judge` | Triage's judgment, the admit shadow, the land gate, the landed check, and the recommendation when an item's rounds are used up | `medium` |
| `@link` | Placing an item among the project's open work, in triage | `medium` |
| `@planner` | Plan, and the split | `large` |
| `@builder` | Build, and every fix round | `large` |
| `@reviewer` | The review: is the change right against the item | `large` |
| `@test-checker` | The test check: do the tests the change adds earn their place | `large` |
| `@product-reviewer` | The product review: is the change right for the product's users | `large` |
| `@verdict` | Merging the three check reports into one verdict | `small` |
| `@host` | Reading what the host's own checks and reviews say | `medium` |
| `@lander` | The land stage | `medium` |
| `@reporter` | Writing the report on the pull request | `medium` |
| `@manager` | The discoveries drain | `large` |
| `@investigator` | The `investigate` workflow, which no binding starts | `large` |
| `@validator` | The `validate` workflow, which no binding starts | `medium` |

**How.** Define aliases for the whole install:

```bash
archon ai alias set @reviewer codex gpt-6.1-sol
```

or write them under `aliases:` in `~/.archon/config.yaml` or the project's `.archon/config.yaml`, or keep them in a run config that only the factory's starts use (next section).

**A recommended setup.** These are recommendations, not requirements. They are what one working install of this pack runs today, some of them still on trial. Provider and model names are examples; use what your install has.

```yaml
aliases:
  '@planner': { provider: claude, model: opus }
  '@builder': { provider: claude, model: opus }
  '@manager': { provider: claude, model: opus }
  '@reviewer': { provider: codex, model: gpt-6.1-sol }
  '@product-reviewer': { provider: codex, model: gpt-6.1-sol }
  '@host': { provider: codex, model: gpt-6.1-sol }
  '@judge': { provider: claude, model: sonnet }
  '@link': { provider: claude, model: sonnet }
  '@test-checker': { provider: claude, model: sonnet }
  '@verdict': { provider: claude, model: sonnet }
```

| Role | Recommendation | Reason |
|---|---|---|
| `@planner`, `@builder` | Your strongest coding model | The plan and the first build decide how many rounds follow. A weaker model here costs more in fix rounds than it saves. |
| `@manager` | Your strongest model | It decides what becomes new work in the project's tracker, and it runs at most once per landed change. |
| `@reviewer`, `@product-reviewer` | A strong model from a different provider than the builder | A check that shares the builder's model tends to share its blind spots. |
| `@host` | A strong model | It reads CI logs and review comments and decides what goes back to the builder. On trial on the working install; it ran on the medium tier before. |
| `@judge`, `@link` | A mid-size model | Short judgments from a policy and a few facts. They run often. |
| `@test-checker`, `@verdict` | A mid-size model | On trial on the working install, which moved both up from a small model. |
| `@lander`, `@reporter` | Leave unset | The medium tier does this work. |

### The run config a binding launches with

**What it does.** A run config is a YAML file with the settings one start should use, such as `aliases:` and `tiers:`. `archon pack bindings --config <file>` writes it into every generated binding as `launch.configSource`, so the factory's runs use it and nothing else on the install does.

**Default.** None. Starts run on the install's config and the project's `.archon/config.yaml`.

**Change it when** the factory should run on different models than your other Archon work, or you want to try a model setup without touching the install config.

**How.** Write the file, for example `factory-run-config.yaml` holding the `aliases:` block above, then generate and register the bindings with it:

```bash
archon pack bindings Wirasm.archon-software-factory --repo github.com/<owner>/<name> --host <host-id> --run-as <user-id> --cwd <path to the checkout> --out <bindings-dir> --config <path to factory-run-config.yaml> --force
```

`--force` replaces the files already in `<bindings-dir>`. Run each `archon trigger add` line again, then `archon trigger check`.

An item keeps the config its most recent run started with, so editing the file changes new items and not items in flight. To change one item, start a run on it by hand with the new file: `archon workflow run <workflow> --item <key> --config <file>`. Later starts on the item carry that config.

### Policy files and project settings

**What it does.** What a stage holds a change to is not in its prompt. Each stage reads the pack's default in [`policy/`](policy/) first, then the project's own file when the project names one, and the project's line wins where they differ.

**Default.** Every setting is empty. The pack's defaults are short on purpose: a project with no policy of its own is held to its own guidance, the agent guidance file at its root and the documents that file points to.

**Change it when** the factory keeps asking something your maintainers have already decided, holds changes to the wrong bar, or should land some changes without asking.

**How.** Put a settings file in the project at `.archon/packs/Wirasm.archon-software-factory.yaml` and commit it. A run reads it from its own checkout, so an uncommitted file is not seen.

```yaml
settings:
  review_policy: .archon/factory/policy/review.md
  test_policy: .archon/factory/policy/tests.md
  land_policy: .archon/factory/policy/land.md
  validate_command: "<the command that proves a change>"
```

Paths are relative to the project, or absolute. An unknown key refuses the run before its first node and names the file and the key. `archon validate workflows` checks the file without starting a run.

| Setting | What the document says | Read by |
|---|---|---|
| `triage_policy` | What maintainers judge work items against | Triage |
| `plan_policy` | What maintainers hold a design to | Plan |
| `split_policy` | When an item is built as several changes, and how a PRD, an epic and a bundle are cut | Split |
| `build_policy` | What maintainers hold the code of a change to | Build |
| `review_policy` | What maintainers hold a change to before it lands | Review, verdict, `inspect` |
| `test_policy` | What maintainers hold tests to | Test check, `inspect` |
| `product_policy` | What the project is for, who uses it and how it wants to feel | Product review |
| `host_policy` | Which checks a change needs that the host does not start by itself, and how to start them | Host round |
| `land_policy` | Which ready changes may land without an ask, how a change is merged, what must hold after | Land gate, land, landed check |
| `discoveries_policy` | What maintainers want filed from what agents notice | Discoveries drain |
| `admit_policy` | Which items may start without an operator being asked | Triage's admit shadow. Recorded; nothing acts on it. |
| `validate_command` | The command that proves a change works, run from the project's root | The land stage when the project has no host, and the `validate` workflow, which no binding starts |
| `checks_file`, `propose_policy` | Declared in [`.pack/pack.yaml`](.pack/pack.yaml) | No stage reads them today |

Two settings matter most:

- **`land_policy`.** Without one, the land gate asks an operator before every merge. A land policy names which ready changes may land by themselves, for example by size, by green checks and by paths the change must not touch.
- **Rulings.** Keep a file named `rulings.md` beside your policy files: one entry per question your maintainers have already answered, with the answer. Every stage reads it before it leaves an ask, and a question a ruling answers is not asked again. [`policy/rulings.md`](policy/rulings.md) says how it is kept.

Archon's own policy files are in its repository under `.archon/factory/policy/`.

### Label intake: a label is a work order

**What it does.** Adding the label `factory` to an issue orders that issue, on the item `issue-<number>`. No order file, no `trigger fire`.

**Default.** Off. Items start only from `archon trigger fire`.

**Change it when** an operator who has no shell on the factory's machine should be able to order work.

**How, on an install that receives no webhooks** (a laptop, a machine behind NAT). Archon reads the label from the forge on a timer.

1. Get the GitHub source plugin module. With Archon running from a source checkout, use the file `packages/adapters/src/forge/github/source-plugin.ts` in that checkout. Otherwise build it in a source checkout with `bun run --cwd packages/adapters build:github-source-plugin` and copy `packages/adapters/dist/github-source-plugin.mjs` to a directory you own.
2. Write a sources file, for example `<bindings-dir>/sources.json`. Paste the whole content of the generated `...-order-on-label-<digest>.json` file as the one entry of `bindings`:

   ```json
   {
     "version": 1,
     "sources": [
       {
         "sourceInstanceId": "github-factory",
         "module": "<absolute path to the source plugin module>",
         "observe": { "everySeconds": 60 },
         "config": {
           "version": 1,
           "host": "github.com",
           "bindings": [ <the object from the order-on-label file> ]
         }
       }
     ]
   }
   ```

   `everySeconds` is how often the label is read; the minimum is 15. Leave out `webhookSecretEnv`: a source that has it receives labels by webhook and observes none.
3. Tell Archon where the file is. Add this line to `~/.archon/.env`, which every Archon process on the install reads:

   ```
   ARCHON_WEBHOOK_SOURCES=<absolute path to sources.json>
   ```
4. Install the [wake timer](#the-wake-timer), which does the reading.
5. Check: `archon trigger check` lists the source under `observing` and says when no installed wake job reads it.

Things to know before you rely on it:

- **Labels already on issues start nothing.** The first pass records every issue that carries the label and starts none. Only a label added after that pass orders the issue.
- **Once per add.** Removing the label and adding it again orders the issue again.
- **A label added and removed between two passes is never seen.**
- **A labelled pull request is ordered too.** The binding does not select a kind, so the label on a pull request also starts an order, on the item `issue-<number>`. Put the label on issues only.
- **The forge plugin must support `workitem.label.added`.** Check it with `archon forge check` as in step 2 of the setup.
- Each start is an ordinary binding start, so the `order` capacity and the run limit decide when it runs.

**On an install that receives webhooks,** the same binding object goes into the same `bindings` array of a source with `webhookSecretEnv`, and a server started with `ARCHON_TRIGGER_HOST=<host-id>` starts the runs. Archon's guide covers the server side: [configure GitHub event starts](https://archon.diy/guides/workflow-triggers/#configure-github-event-starts).

### The wake timer

**What it does.** Installs one job per Archon install that keeps `archon workflow wake --watch` running. The watch reads labels for label intake, starts a stage whose starting process died, and continues paused runs when what they wait for happens.

**Default.** Not installed. The factory's stage-to-stage starts do not need it: the process that ends a run or records an answer starts what follows.

**Change it when** you use label intake, or you want starts that were left behind picked up without a command by hand.

**How.** The command is the same on every operating system:

```bash
archon workflow wake schedule install --json
archon workflow wake schedule status --json
archon workflow wake schedule remove --json
```

| Operating system | What `install` creates | Notes |
|---|---|---|
| macOS | A LaunchAgent in `~/Library/LaunchAgents/` | Runs while you are logged in to a desktop session. |
| Linux | A systemd user timer and service in `~/.config/systemd/user/` | Needs a reachable `systemctl --user`. It runs while you have a session; `loginctl enable-linger` keeps it running without one. |
| Windows | A Task Scheduler task under `\Archon\` | Runs while you are logged on. Task Scheduler shows the last result `0x800710E0` while the watch runs; that is the scheduler declining to start a second copy, not a failure. |

`--interval <seconds>`, on `install` only, sets how soon a watch that exited is started again. The default is 5 seconds, and on Windows 60, where it must be a whole number of minutes. The watch itself polls every five seconds whatever the interval.

`status` prints whether the job is installed and registered, and, once the watch has run, its last pass and what that pass failed on.

Remove and install the job again after you change its `PATH`, after `brew upgrade archon` (the job records the versioned executable), or to change the interval. If you set `ARCHON_WEBHOOK_SOURCES` only in the shell that runs `install`, and not in `~/.archon/.env`, the job passes that file to its own watch and no other process observes it.

### How many items run at once

**What it does.** Each stage holds a resource with a capacity, the number of runs of that stage at once. A start that finds its stage full queues and starts when a slot frees.

**Default.** From [`.pack/pack.yaml`](.pack/pack.yaml):

| Stage | Runs at once |
|---|---|
| Order, triage, plan, split, land gate, landed check | 3 each |
| Build, check, host round | 5 each |
| Discoveries drain, close | 2 each |
| Land | 1 |

**Change it when** the machine or your provider limits cannot carry the defaults, or when you want a slower factory while you measure it. Leave land at 1: one landing at a time means the second change is read against a branch that already has the first.

**How.** In `~/.archon/config.yaml`. A resource's key is the `resource` value in a generated binding file, exactly as written there; it names the pack, the repository and the stage.

```yaml
concurrency:
  runs: 6
  resources:
    "<the resource value from a stage-build binding file>": 2
```

`concurrency.resources` wins over the pack's number. `concurrency.runs` is the one number for the whole machine: how many top-level runs Archon executes at once, whatever their stage or project. Without it there is no limit. Both are read at every start, so a change applies to the next start. Lowering one never stops a run that is already going.

### Landing branch, and work that is part of a larger item

**What it does.** `land_on` in a work order names the branch the item's change lands on. It reaches every stage: the builder builds on that branch and proposes against it, and the land stage merges only a change proposed against it. A change proposed against another branch stops with an ask.

**Default.** Empty: the project's base branch.

**Change it when** an item should land on a release branch, or several items should land together on one branch before that branch lands once.

**How, for one item on its own branch.** The pack does not create the branch. Create it and record it on the item first, from the project's checkout, then order with the same branch:

```bash
archon workflow landing --item <key> --branch <branch> --from origin/<base branch>
```

`--from` creates the branch on the project's remote from that start point; leave it out for a branch that exists. With the branch recorded, the engine cuts every stage's worktree on the item from it. Without the record, the first worktree is cut from the base branch and the builder moves onto `land_on` itself. Then put `"land_on": "<branch>"` in the order.

**How, for items that are part of a larger item.** Record the branch on the larger item's key, link each member to it, and order each member with the branch and the larger item's key:

```bash
archon workflow landing --item <larger key> --branch <branch> --from origin/<base branch>
archon workflow link --item <member key> --kind part_of --to <larger key>
```

```json
{ "key": "<member key>", "text": "<the member's work>", "land_on": "<branch>", "part_of": "<larger key>" }
```

A member that records no branch of its own takes the branch of the item it is part of. The members land on the shared branch one at a time. Landing that branch on the base is not a stage of the pack: an operator proposes and lands it. A [split](#items-that-are-not-one-change) orders its members with `land_on` and `part_of` by itself and records the links; it does not create the branch.

### Review someone else's pull request

`inspect` reads a pull request's own description as the item, runs the review and the test check on the proposed commit, and posts the same kind of report with findings on their lines. It changes nothing in the pull request. Run it from the project's checkout:

```bash
archon workflow run Wirasm/archon-software-factory:inspect --input change=https://github.com/<owner>/<name>/pull/45
```

## Pause everything

To stop new work from starting without cancelling anything, set the install hold:

```bash
archon hold set
archon hold lift
```

While the hold is set, no new run starts from any source on the install, not only the factory's. Runs already going finish. Orders, labels and answers are still recorded, and the starts they cause are kept. `archon hold lift` starts what was kept, in the order it arrived. The hold survives restarts, and nothing lifts it on a timer. `archon workflow status` says when it is set, who set it and which starts it keeps.

## Update the pack

```bash
archon hold set
archon plugin update Wirasm/archon-software-factory
archon pack bindings Wirasm.archon-software-factory --repo github.com/<owner>/<name> --host <host-id> --run-as <user-id> --cwd <path to the checkout> --out <bindings-dir> --force
```

Pass `--config` again if you used it. Then:

1. Run every `archon trigger add` line the command printed. A file with the same name replaces the one registered before.
2. Remove what the pack no longer declares. A binding the update dropped leaves its old file in Archon's triggers directory (`~/.archon/triggers/`, or `triggers/` under `ARCHON_HOME`). Delete each file there that an earlier `pack bindings` run wrote for this repository and that is not in the list the command just printed. `archon trigger check` reports a leftover whose stage no longer exists.
3. If you use label intake, replace the binding object in your sources file with the new `...-order-on-label-<digest>.json`.
4. Run `archon trigger check` and fix what it reports.
5. Run `archon hold lift`.
6. Copy the [skill](#install-the-skill) again.

The hold keeps a stage from ending in the middle of the update, when half the bindings are new. A run that started before the update finishes on the pack revision it started with.

## When nothing starts

Work through these in order, from the project's checkout.

1. **Read the item.** `archon workflow runs --item <key>` shows its runs and outcomes, starts that wait and what each waits behind, whether the hold or the run limit is holding it, and its open asks.
2. **An ask is open.** Nothing that follows a stage starts while its asks are open. `archon workflow attention` lists them.
3. **The hold is set.** `archon workflow status` says so. Lift it with `archon hold lift`.
4. **A binding is broken or missing.** `archon trigger check` exits nonzero and names the file. `archon pack graph Wirasm.archon-software-factory` shows every arrow between stages, whether it is active on this install, and which outcomes start nothing.
5. **The item ended on an outcome nothing starts on.** These end the item's movement by design or for now: an order that was `refused`; a triage judgment other than `build`, `narrow` or `split`; a plan that ended `stop`; a split that ended `waiting`; a host round that ended `waiting`; the close step. Read why with `archon workflow get <run-id> --json`.
6. **Its stage is full.** The item read says what the start waits behind. See [how many items run at once](#how-many-items-run-at-once).
7. **A start was admitted and nothing runs it.** The item read shows its state as `unowned`. Run it once with `archon trigger execute <request-id> --host <host-id>`.
8. **A run on the item lost its process.** One run of a stage works an item at a time, so a dead run holds the item. The item read says when a run's owner is gone and prints `archon workflow resume <run-id>` and `archon workflow abandon <run-id>`.
9. **You answered through the Web UI or the API.** The server prepares starts only for the host its `ARCHON_TRIGGER_HOST` names. Run `archon trigger drain --host <host-id>`, or install the wake timer.
10. **A label started nothing.** Check `archon workflow wake schedule status --json` and the `observing` part of `archon trigger check`. The label may have been on the issue before the first pass, which starts nothing.

## Items that are not one change

Triage ends `narrow` when part of an item should not be built: the smaller part is planned and the rest is dropped. It ends `split` when all of the item is worth building, but not as one change: an epic, a PRD, a bundle of tasks, or parts that must land apart. That starts the split stage, which reads the project and decides by the item's kind, held to [`policy/split.md`](policy/split.md) and the project's own `split_policy`. A piece is cut off only when it cannot be part of the same change. A run ends one of three ways:

| Outcome | What starts |
|---|---|
| `whole` | Plan, on the item as it is. |
| `split` | Each member that starts now becomes a work item of its own, with the key `<item key>-<member id>`, recorded as part of the item. It goes through order and triage like any other item. |
| `waiting` | Nothing. Every member waits on a ruling or a signal. |

A member that starts later has no brief yet. It stays in the run's result with what it waits on (`archon workflow get <run-id> --json`). A member that depends on another member never starts now, whatever the cut said. A ruling a member waits on is an ask on the item, and answering it starts the split again, which starts the member. Nothing watches a signal or a member landing: start the split again when it has happened.

To split an epic or a PRD without triage, start the stage on its item. With the bindings registered, its outcome starts what the table says.

```bash
archon workflow run Wirasm/archon-software-factory:split --item <key> --input-file item=<a file with the item's text>
```

## Delivery as three stages

Delivery is three stages, `stage-build`, `stage-check` and `stage-host`, each a run of its own on the item, started by the pack's bindings. A check that returns the change starts the builder in the session it last had on the item; an approval starts the host round; and an answer starts only the stage its option names.

An item is allowed three check rounds and three host rounds, counted since it was last planned. When a round would return the change with the rounds used up, it ends in an ask, and `one-more-round` allows the item one more. An agent then recommends one of the options. Each check run leaves the report on the pull request, and the host stage closes it. Each check or host run's result says which round it was and how many the item is allowed (`archon workflow get <run-id> --json`, under `terminal_record.returns.value`).

To start a build by hand on an item:

```bash
archon workflow run Wirasm/archon-software-factory:stage-build --item <key> --input-file item=<a file with the item's text>
```

## What is not there yet

- **It merges only what was allowed.** After a ready change the land gate decides: it ends `land` when the project's land policy lets the change land by itself, and asks otherwise, always when the project names no land policy. The land stage then merges the change into its landing branch through the forge, when it still merges and the host's checks at its head are green; a change that does not goes back to its builder. Landing is not waited for by anything that depends on the item.
- **`take-as-is` on a host ask starts nothing.** The change stands, and an operator lands it or closes it by hand.
- **A host round that ends `waiting` starts nothing and leaves no ask.** The host stage gave up waiting for the project's checks or reviews. Nothing reads the host again by itself. The item read shows the outcome; an operator starts the host round again.
- **Triage and plan can stop an item without an ask.** Triage ends `shape` for an item that is worth doing and cannot be planned until a maintainer has settled its open questions, and lists them. Nothing runs the shaping: an operator does it and orders the item again. The same holds for its other judgments that are not `build`, `narrow` or `split`, and for a plan that ends `stop`: the result says why, and nothing starts.
- **`depends_on` is recorded and nothing waits on it.** An order accepts it. No stage reads it, and an item is not held until what it depends on has landed. Order dependent items in sequence yourself.
- **A label orders pull requests too.** The `order-on-label` binding does not tell an issue from a pull request. See [label intake](#label-intake-a-label-is-a-work-order).
- **Nothing enters on its own.** Every item starts because an operator ordered it, by hand or with the label. Triage records whether an item could have started without asking, as a shadow; nothing uses it yet.
- **The drain files at most three items a run.** The discoveries drain starts when a change has landed and decides what should become a work item. When the project has a tracker it creates the three most valuable there, and holds the rest; its result says where each was filed. With no tracker it writes nothing and an operator files them.
- **A split starts its first members and nothing after them.** A member that waits on a signal, or on another member landing, starts only when the split runs again, by an answer or by hand. The members' landing branch reaches them as `land_on`; the split does not create the branch or record it on the item.
- **Changes built side by side can conflict.** A change that was ready stops merging when a sibling lands first. The land gate names the other open changes that touch the same files and the order it would land them in; nothing brings the later one up to date before its land is refused and it goes back to its builder.
- **The landing branch is enforced at the merge, not before it.** `land_on` reaches every stage, and the land stage merges only a change proposed against it: one proposed against another branch stops with an ask. Unless an operator records the branch on the item first ([landing branch](#landing-branch-and-work-that-is-part-of-a-larger-item)), the engine cuts the first worktree from the base branch, and only the build prompt moves the builder onto `land_on`. The land stage records the branch on the item after the merge, so later work on the item is cut from it.
- **After a landing, one result is acted on.** When the landed check finds the change broke its branch and writes a work order, that order starts as new work on the same item. Every other result of the landed check is only recorded.
- **Some settings and workflows are not wired.** `checks_file` and `propose_policy` are declared and read by no stage. The `validate` and `investigate` workflows exist and no binding starts them.
- **No skill installer.** The skill is copied by hand.
- **No screenshots in the report.** The forge has no way to attach a file.

## License

MIT
