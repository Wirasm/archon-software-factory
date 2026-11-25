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

Keep the plugin as new as Archon: `archon plugin update <id>`, with the id `archon plugin list` shows. When the land stage merges a change, the engine records the merge and the landing branch on the item (`archon workflow runs --item <key>` shows both) from the merge time the plugin reports. A plugin from before that reports none: the change still merges, nothing is recorded on the item, and the merge command says to update the plugin. A change that was already merged when the land stage ran, by hand for example, is not recorded either; record it with `archon workflow merged`.

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

- **Run-ended bindings** and **asks-settled bindings**: register every one. The command prints an `archon trigger add '<file>'` line for each, about sixty-five of them. Run those lines, or register them in one go: every generated file except the order file and the label file.

  ```bash
  for f in <bindings-dir>/*.json; do echo "$f" | grep -Eq -- '[^k]-order-(on-label-)?[0-9a-f]+\.json$' || archon trigger add "$f"; done
  ```

  PowerShell: `Get-ChildItem <bindings-dir>\*.json | Where-Object { $_.Name -notmatch '[^k]-order-(on-label-)?[0-9a-f]+\.json$' } | ForEach-Object { archon trigger add $_.FullName }`

  The pattern leaves out the order file and the label file, and keeps `...-order-after-work-order-work-order-<digest>.json`, which starts the members of an order of several items. A file is active as soon as it is added.
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
| `part_of` | The key of the larger item this one is a piece of, when you already know it. The order records the link. | Empty: it stands alone. |
| `depends_on` | Keys of items that must land first, separated by commas, when you already know them. The link stage takes it as a fact, and the item [waits](#items-that-wait) until each has landed. You are never required to say it: the factory finds what an item depends on. | Empty. |
| `items` | For [an order of several items](#order-several-items-at-once): the members, each with its own `key`, a `source` or `text`, and optionally `depends_on`. | Empty: an order of one item. |

```bash
archon trigger fire --config <bindings-dir>/<the order file> --inputs order.json
```

The command returns as soon as the order is taken; the stages that follow run in the background. The first order registers the project with Archon; there is no separate step. The order becomes a work item, and the engine starts each next stage when the one before ends: triage, the split when triage calls for one, the link stage, plan, build, check and host rounds, the land gate, the land stage, the landed check and the discoveries drain. An order that names only a `key` orders that item again from its own last order.

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

The answer starts what comes next, and what you wrote reaches that run as a decision already made. Rule by answering: a run reads the item as it was ordered, so an edit or a comment on the issue after the order reaches no later stage. To keep an item waiting, leave its ask open and answer when you know. A stage that has no basis to choose leaves its ask without a recommendation and says in the recommendation's place why it cannot choose; it does not guess one.

Which options an ask offers depends on the stage that left it:

| Ask left by | Options |
|---|---|
| Plan, split | The stage's own options, written for that question. An answer starts the same stage again with the answer. |
| Link | `wait`, `start-anyway`, `drop`. An answer starts the link stage again, which carries it out. |
| Build | `send-back`, `replan`, `take-as-is`, `drop`, `reshape`. |
| Check, host | `send-back`, `one-more-round`, `replan`, `take-as-is`, `drop`, `reshape`. |
| Land gate, land | `land`, `send-back`, `drop`, `reshape`. |

Except for plan and split, a stage's options are declared in its workflow (`returns.options`), with what each does and costs, so every ask of the stage offers the same set and `archon workflow attention --json` shows it. Every ask can also be answered in your own words (`--choose other --text "..."`); on a delivery or landing ask that starts nothing, so prefer an option.

| Option | What starts |
|---|---|
| `send-back` | The builder, in the checkout it left, with your answer. Then the checks look at the change again. (After a build that was itself a host fix, the host round looks at it.) |
| `one-more-round` | The builder, with what was returned, and then one more round: after a check ask the checks run again; after a host ask the change goes straight back to the host round. If that round returns the change again, you are asked again. |
| `replan` | Plan, then delivery. |
| `take-as-is` | After a build or check ask: the host round, on the change as it is. After a host ask: the land gate. |
| `land` | The land stage, which merges the change when it still merges and its checks are green. |
| `drop` | The close step: the change is closed without merging, with your answer written on it. The item ends. On a link ask there is no change yet: the link stage ends `dropped`. |
| `wait` | The link stage, which ends `waiting` again. The item goes on when what it waits on lands. |
| `start-anyway` | The link stage, which ends the item's links to what it waited on and ends `place`, so plan starts. On an ask about two items that overlap, the item is planned as it is. |
| `reshape` | The close step: the change stays open as a draft, with your answer written on it. Nothing more is built until the item is shaped again. |

When a run left several asks, answer all of them: the next stage starts when the last one is answered. For build, check, host and landing asks it starts only when every answer chose the same option. `archon workflow answer` says so when a settlement starts nothing.

Delivery keeps one report on the pull request and replaces it after every round: the rounds, what is still to change, what the item asks for and how each was checked, and how the run ended. Findings that name a file and a line are also posted on those lines as one review per round.

## Install the skill

The pack ships a skill at [`skill/archon-software-factory/`](skill/archon-software-factory/SKILL.md) that teaches a coding agent to operate the factory: where every item is, what waits on an operator, ordering, answering asks, pausing, and what to check when a session starts. Install it from the project your agent works in, after the pack itself is installed:

```bash
archon skill add --pack Wirasm/archon-software-factory
```

It copies the skill into `.claude/skills/archon-software-factory/` and `.agents/skills/archon-software-factory/`; Claude Code reads the first and Codex the second. Run it again after a pack update: it replaces both folders whole. The skill builds on Archon's own `archon-cli` skill, which `archon skill add` installs into the same two folders.

## Optional settings

Everything in this section has a working default. Change a setting when its "change it when" line applies to you.

### Models: which model runs which role

**What it does.** No workflow in the pack names a provider or a model. Each agent node names a role as a model alias with a tier to fall back on, such as `['@builder', large]`. The first alias your config defines wins; an alias you do not define runs on the tier.

**Default.** No alias is defined, so every role runs on the `large`, `medium` or `small` tier of your Archon config.

**Change it when** you want a role on a specific model: a stronger planner, a reviewer from another provider than the builder, a cheaper judge.

| Alias | Role | Falls back to |
|---|---|---|
| `@judge` | Triage's judgment, the admit and complexity shadows, the land gate, the landed check, and the recommendation when an item's rounds are used up | `medium` |
| `@link` | The link stage: whether an item can be built now, and how it relates to other work | `medium` |
| `@planner` | Plan, and the split | `large` |
| `@builder` | Build, and every fix round | `large` |
| `@reviewer` | The review: is the change right against the item | `large` |
| `@test-checker` | The test check: do the tests the change adds earn their place | `large` |
| `@product-reviewer` | The product review: is the change right for the product's users | `large` |
| `@verdict` | Merging the three check reports into one verdict | `small` |
| `@host` | Reading what the host's own checks and reviews say | `medium` |
| `@lander` | The land stage | `medium` |
| `@reporter` | Writing the report on the pull request | `medium` |
| `@manager` | The discoveries drain, and the attend stage's advice | `large` |

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
| `@manager` | Your strongest model | It decides what becomes new work in the project's tracker, and it runs at most once per landed change. The attend stage runs on it once for each run that leaves asks. |
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
| `attend_policy` | What an agent may do with an ask: which are always the operator's, which kinds it may answer alone, the rulings already made | The attend stage. It advises; nothing acts on its answers. |
| `validate_command` | Not a document: the command that proves a change works, run from the project's root | The land stage when the project has no host |
| `land_gate` | Not a document: `shadow` (the default) or `policy`. Whether the land gate acts on the land policy | Land gate |

Two settings matter most:

- **`land_policy` and `land_gate`.** A land policy names which ready changes may land by themselves, for example by size, by green checks and by paths the change must not touch, and what must hold on the branch after a landing. The land gate judges every ready change against it. With `land_gate: shadow`, the default, nothing acts on that judgment: the gate asks an operator before every merge, and the ask's context says what the policy would have done ("the land policy would have landed this without asking", or "would have asked, because ..."). The gate's result carries the same as `would` (`land` or `ask`), and the metric `sf.landgate_would_land` counts it, so you can compare the policy with your own answers before you trust it. Set `land_gate: policy` to let it act: a change the policy lets land then starts the land stage with no ask. The landed check reads the policy's after-landing part either way.
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
| Order, triage, link, plan, split, land gate, landed check | 3 each |
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

**How, for several items that land together.** Create the branch, then [order the items as one work order](#order-several-items-at-once) with `"land_on": "<branch>"`:

```bash
archon workflow landing --item <work order key> --branch <branch> --from origin/<base branch>
```

The order records the branch on the work order's item, and a member that records no branch of its own takes the branch of the item it is part of. A branch the remote does not have refuses each member's first run and names the command above. The members land on the shared branch one at a time. Landing that branch on the base is not a stage of the pack: an operator proposes and lands it. A [split](#items-that-are-not-one-change) orders its members with `land_on` and `part_of` by itself and records the links; it does not create the branch.

One item ordered by hand with `"part_of": "<larger key>"` is recorded as part of that item, and takes its branch the same way.

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

Update when no start of the pack is queued. A start that is already queued (waiting for capacity, for its item or for its checkout) keeps the inputs it was prepared with, and the hold does not move it: it stays queued until the hold lifts. When the update removed a setting or an input its stage declared, that start is then refused, the stage never runs, and its item looks finished when it is not.

```bash
archon workflow status    # lists running runs and queued starts; wait until none is of this pack
archon hold set
```

Wait for running runs too: the start a run owes when it ends is matched against the binding files as they are at that moment. If you must update with runs running or starts queued, note their items first, and after step 5 look in `archon trigger list` for a refused start and start that stage on its item again by hand.

```bash
archon plugin update Wirasm/archon-software-factory
archon pack bindings Wirasm.archon-software-factory --repo github.com/<owner>/<name> --host <host-id> --run-as <user-id> --cwd <path to the checkout> --out <bindings-dir> --force
```

Pass `--config` again if you used it. Then:

1. Run every `archon trigger add` line the command printed. A file with the same name replaces the one registered before.
2. Remove what the pack no longer declares. A binding the update dropped leaves its old file in Archon's triggers directory (`~/.archon/triggers/`, or `triggers/` under `ARCHON_HOME`). Delete each file there that an earlier `pack bindings` run wrote for this repository and that is not in the list the command just printed. `archon trigger check` reports a leftover whose stage no longer exists.
3. If you use label intake, replace the binding object in your sources file with the new `...-order-on-label-<digest>.json`.
4. Run `archon trigger check` and fix what it reports.
5. Run `archon hold lift`.
6. Install the [skill](#install-the-skill) again.

The hold keeps a stage from ending in the middle of the update, when half the bindings are new. A run that started before the update finishes on the pack revision it started with.

## When nothing starts

Work through these in order, from the project's checkout.

1. **Read the item.** `archon workflow runs --item <key>` shows its runs and outcomes, starts that wait and what each waits behind, whether the hold or the run limit is holding it, and its open asks.
2. **An ask is open.** Nothing that follows a stage starts while its asks are open. `archon workflow attention` lists them.
3. **The hold is set.** `archon workflow status` says so. Lift it with `archon hold lift`.
4. **A binding is broken or missing.** `archon trigger check` exits nonzero and names the file. `archon pack graph Wirasm.archon-software-factory` shows every arrow between stages, whether it is active on this install, and which outcomes start nothing.
5. **The item waits on another item.** Its last link run ended `waiting`. The item read lists what it depends on under `Links`, and the run's result names it in `waits_on`. See [items that wait](#items-that-wait).
6. **The item stopped, or it is finished.** `archon workflow attention` lists an item as `stopped`, with the stage, the outcome and one line of why, when its last run ended where nothing starts and left no ask: an order that was `refused`; a triage judgment other than `build`, `narrow` or `split` (`shape`, `recipe`, `native`, `fold`, `park`, `deprecate`, `decline`, `close`: each is a call a maintainer has to see and act on); a plan that ended `stop`; a split that ended `waiting`; a host round that ended `waiting`; a landed check that ended `broken_before`, `unclear`, `waiting` or `not_landed`; a close step that ended `reshape` or `not_closed`. It needs an operator, takes no answer, and stays listed until a run starts on the item again. An item that is finished is not listed: each stage declares the outcomes after which the item needs nothing more (`returns.final`). Those are a link run that ended `dropped` or `none`, a close step that ended `dropped`, and a landed check that ended `clear` or `none`. A link run that ended `waiting` is not listed either: the item is woken when what it waits on ends. Read any run's result with `archon workflow get <run-id> --json`.
7. **Its stage is full.** The item read says what the start waits behind. See [how many items run at once](#how-many-items-run-at-once).
8. **A start was admitted and nothing runs it.** The item read shows its state as `unowned`. Run it once with `archon trigger execute <request-id> --host <host-id>`.
9. **A run on the item lost its process.** One run of a stage works an item at a time, so a dead run holds the item. The item read says when a run's owner is gone and prints `archon workflow resume <run-id>` and `archon workflow abandon <run-id>`.
10. **You answered through the Web UI or the API.** The server prepares starts only for the host its `ARCHON_TRIGGER_HOST` names. Run `archon trigger drain --host <host-id>`, or install the wake timer.
11. **A label started nothing.** Check `archon workflow wake schedule status --json` and the `observing` part of `archon trigger check`. The label may have been on the issue before the first pass, which starts nothing.

## Items that are not one change

Triage ends `narrow` when part of an item should not be built: the smaller part is planned and the rest is dropped. It ends `split` when all of the item is worth building, but not as one change: an epic, a PRD, a bundle of tasks, or parts that must land apart. That starts the split stage, which reads the project and decides by the item's kind, held to [`policy/split.md`](policy/split.md) and the project's own `split_policy`. A piece is cut off only when it cannot be part of the same change. A run ends one of three ways:

| Outcome | What starts |
|---|---|
| `whole` | Plan, on the item as it is. |
| `split` | Each member that starts now becomes a work item of its own, with the key `<item key>-<member id>`, recorded as part of the item. It goes through order and triage like any other item, or waits for the member it depends on. |
| `waiting` | Nothing. Every member waits on a ruling or a signal. |

A split's members are the members of a work order: each is recorded as part of the item and ordered like any other item. A member whose only reason to wait is another member is a work item from the start, with its brief: it is ordered with that dependency, the link stage holds it ([items that wait](#items-that-wait)), and it goes on by itself when the other lands. A member that waits on a ruling or a signal starts later and has no brief yet. It stays in the run's result with what it waits on (`archon workflow get <run-id> --json`). A ruling is an ask on the item, and answering it starts the split again, which starts the member. Nothing watches a signal: start the split again when it has happened.

To split an epic or a PRD without triage, start the stage on its item. With the bindings registered, its outcome starts what the table says.

```bash
archon workflow run Wirasm/archon-software-factory:split --item <key> --input-file item=<a file with the item's text>
```

## Order several items at once

A work order of several items is an item whose members are part of it. Give the order a key of its own and list the members:

```json
{
  "key": "wo-12",
  "land_on": "",
  "items": [
    { "key": "issue-41", "source": "https://github.com/<owner>/<name>/issues/41" },
    { "key": "issue-42", "source": "https://github.com/<owner>/<name>/issues/42", "depends_on": "issue-41" },
    { "key": "wo-12-docs", "text": "The work as text, for a member that lives in no tracker." }
  ]
}
```

Fire it like any order. The order stage ends `work_order`: it records each member as `part_of` the work order (`archon workflow runs --item wo-12` lists them under `Links`), and each member is then ordered by itself and goes through triage and the link stage like any other item. With `land_on`, the branch is recorded as the work order's [landing branch](#landing-branch-and-work-that-is-part-of-a-larger-item) and every member lands on it; create the branch first. Without it, each member lands on the base branch.

You do not link anything by hand, and `depends_on` on a member is optional: the order stage records that each member is part of the order, and the link stage finds and records which member has to wait for which.

A member's key is its item's key from then on. Firing the same order again orders only the members that were not ordered before. The work order's own item has no stage after the order: nothing starts when its last member lands.

## Items that wait

After triage judges that an item should be built, the link stage decides whether it can be built now. It is an agent, and the whole question is its own: it reads the item, the other members of its work order, what the order says it depends on and the state of those items, and it records the links itself. An operator never records a link by hand. A link run ends one of these ways:

| Outcome | What starts |
|---|---|
| `place` | Plan. |
| `waiting` | Nothing now. The item holds a `depends_on` link to each item in the result's `waits_on`, and the link stage starts again when one of them ends. |
| `fold` | Nothing. The item overlaps another or is a part of one; the ask says which, and the answer starts the link stage again. |
| `dropped` | Nothing. An operator dropped the item on a link ask. |
| `none` | Nothing. It was started for an item that ended, and this item was not waiting on it. |

An item waits when it cannot be built before another item has landed: it uses what the other adds, or changes what the other replaces. An item that would only be better after another does not wait. The link stage waits on:

- **another member of the same work order or the same split**, when it judges the dependency blocking;
- **what the order states** in `depends_on`, which it takes as given. A split states it for a member that depends on another member.

```bash
archon workflow runs --item <key>
archon workflow get <run-id> --json
```

The first shows the item's last link run as `waiting` and its `depends_on` links; the second has the keys in `waits_on`, under `terminal_record.returns.value`.

**What starts it.** When an item that another depends on ends, the link stage starts again on the waiting item, with its text and judgment read from its own earlier runs. The blocker landed: the link stage ends the link and ends `place`, and plan starts. The blocker ended without landing (dropped or sent back to shaping, judged by triage as not to be built as it is, split, a plan that stopped, or dropped while it waited itself): nothing will land it, so the link stage leaves an ask: `wait`, `start-anyway` or `drop`. It recommends one only when the code tells it whether the item can be built without the other. The same ask is left for an item the order says to wait on that nobody has ordered.

**Shadow, for now.** On an item outside its work order that no order names, the link stage does not wait and records nothing. It names it in its result as `would_wait`, counted as the metric `sf.link_would_wait`, so it can be compared with what then happened to the item.

## Delivery as three stages

Delivery is three stages, `stage-build`, `stage-check` and `stage-host`, each a run of its own on the item, started by the pack's bindings. A check that returns the change starts the builder in the session it last had on the item; an approval starts the host round; and an answer starts only the stage its option names.

**The round limit.** A check that returns the change starts the builder by itself twice on an item, and so does a host read, counted since the item was last planned. So without an operator an item gets three check rounds and three host reads. The engine keeps the count: the two bindings that carry a return to the builder declare `limit: { starts: 2, reset_on: plan }` in [`.pack/pack.yaml`](.pack/pack.yaml), and `archon workflow runs --item <key>` shows where each limit stands. The engine refuses a start past its limit and tells nobody, so a stage never hands on to one: it reads the count, and a round that would return the change with no starts left ends in an ask instead, with an agent's recommendation of what to do. `one-more-round` and `send-back` on that ask start the builder through bindings that have no limit, so an answer is never refused; the round after it asks again if it still returns the change. To change the limit, change `starts` and write the bindings again.

**What returns a change.** The verdict says of each thing the checks found whether it is inside the item (its outcome, something it says must hold, or an acceptance line is not met, including an outcome that does not reach whoever the item is for), caused by the change (something the change added that the item did not ask for is wrong), or beside the item (there before the change, a case the item does not name, or something the plan lists under `not_doing`). Inside and caused-by findings return the change; for a caused-by finding the fix is to remove or shrink what caused it. Beside never returns it: it is carried as noticed to the discoveries drain. The verdict and the exhausted-rounds ask also say how the change's size moved across rounds.

A builder that cannot build the plan, and a check round whose reports say the approach is wrong, send the item back to planning with what they found, once each on an item. After that they end in an ask, and `replan` is one of its options.

Each check run leaves the report on the pull request, and the host stage closes it. Each check or host run's result says which round it was (`archon workflow get <run-id> --json`, under `terminal_record.returns.value`).

To start a build by hand on an item:

```bash
archon workflow run Wirasm/archon-software-factory:stage-build --item <key> --input-file item=<a file with the item's text>
```

## A change that fell behind: the short way back to landing

**Since 2026-11-25.** A change can be approved and then fall behind: another change lands first and the two no longer merge. Nothing is wrong with it. The land stage ends `behind`, and the item takes a short way back:

1. **The same builder** merges the landing branch into the change and resolves the conflicts. It is told to change nothing else.
2. **The `catchup` stage** compares the change before and after. A script lists the lines the change adds and removes on top of its landing branch at the commit the land stage read, and at the new head. Context lines are left out, because a merge moves them. Equal lists mean the change is the one that was approved. An agent then waits for the host's checks at the new head.
3. **Same and green:** the land stage starts again. There is no host round and no second land gate, because the approval was for this change and it still holds.
4. **Anything else** (other lines added or removed, a red check, nothing pushed) goes the long way: the host round and then the land gate, where an operator is asked again.

`archon metrics sf.catchup_ready` counts the changes that took the short way (1) and the long way (0). A check that fails at land time, or anything else wrong with the change, still ends the land stage `returned` and goes to the builder and the host round.

## The attend stage: advice on each ask

**Advice, as of 2026-11-25.** When a stage's run ends with asks, the `attend` stage starts on the item and an agent (`@manager`) reads them the way an operator's own agent would: the asks with their options, every earlier run and answer on the item, its rulings, and the project's policies. For each open ask it records the option it would choose and the answer text it would give, or that it would bring the ask to the operator, with why, how sure it is, and what it read that the asking stage did not have. It answers nothing, starts nothing and changes nothing on the item or the change. Its outcomes are final, so it never shows an item as stopped.

It always leaves to the operator an ask about landing or merging; one whose answer would change a workflow language, a plugin or provider contract, a stored schema or a public API; any ask on an item where an operator already overruled a stage; one it cannot place among the ask's options; and what the project's policy names as the operator's. The `attend_policy` setting adds to or narrows that list.

**The policy is the dial.** The project's attend policy is one document with three parts: the asks that are always the operator's, the kinds of ask an agent may answer alone, and the rulings already made. Today the second part is recorded only: an entry carries `alone: true` when the policy names its kind and the agent would answer it, and nothing acts on that. Compare those entries with what the operator answered; when a kind has held up, the same list is what will let the stage answer it. A project widens or narrows what an agent does with and without its operator by editing that document, never the pack.

**Read it on an item.** `archon workflow runs --item <key>` lists the `attend` runs beside the stage runs they follow. `archon workflow get <attend run id> --json` has, under `terminal_record.returns.value.answers`, one entry per ask: `ref`, `would` (an option id or `escalate`), `text`, `why`, `confidence`, `alone` and `read`. Whoever answers an ask reads its entry first, as advice.

**Compare.** Match each entry by `ref` with the answer the operator gave in the item's `answers` (`archon workflow runs --item <key> --json`): same option, same option with a materially different instruction, a different option, or escalated. `archon metrics sf.attend_would_answer` and `sf.attend_would_escalate` count the asks it would have answered and escalated, and `sf.attend_would_answer_alone` those the policy would let it answer alone, one record per ask.

It starts after these endings, the ones that carry asks: plan `ask`, link `waiting` and `fold`, split `whole` and `split`, and `ask` of each delivery stage. Landing asks, from the land gate and the land stage, are outside it: they are always the operator's. A split that ends `waiting` and a plan that ends `stop` are left out: a run that starts anything no longer shows its item as stopped, and those endings can stop an item with no ask. A second ask on an item while its first `attend` run is still running is skipped, not queued.

## What is not there yet

- **Nothing lands without an operator, unless you switch it on.** After a ready change the land gate asks, every time, and says what the project's land policy would have done. `land_gate: policy` makes the gate act on the policy ([settings](#policy-files-and-project-settings)). The land stage then merges the change into its landing branch through the forge, when it still merges and the host's checks at its head are green; a change that does not goes back to its builder.
- **The round limit asks; it does not stop.** The pack's stages ask before a start would be refused, so the engine's refusal is never reached. A start refused all the same (a binding file changed by hand, a stage that failed before its ask) is on its receipt (`archon trigger list`) and nowhere on the item's asks.
- **A host round that ends `waiting` starts nothing and leaves no ask.** The host stage gave up waiting for the project's checks or reviews. Nothing reads the host again by itself. The item shows as stopped in `archon workflow attention`; an operator starts the host round again.
- **Triage and plan can stop an item without an ask.** Triage ends `shape` for an item that is worth doing and cannot be planned until a maintainer has settled its open questions, and lists them. Nothing runs the shaping: an operator does it and orders the item again. A plan that ends `stop` is the same: the item shows as stopped with the reason, and nothing starts. Triage's other judgments that are not `build`, `narrow` or `split` are the same: nothing starts, and the item shows as stopped with the reason until a maintainer acts on it.
- **The link stage holds an item only inside a work order.** On an item outside the item's work order it does not wait and names what it would have waited on ([items that wait](#items-that-wait)). What an order states with `depends_on` holds everywhere. Before that shadow goes, an outside blocker that nobody has ordered needs its rule: the link stage is told to ask about it and never to wait on it silently, and that is not measured.
- **A waiting item is told only of an ending.** The link stage starts on it again when the item it waits on lands or ends in one of the ways listed under [items that wait](#items-that-wait). Nothing tells it when that item only sits: an ask nobody answers, a host round that ended `waiting`, an issue closed on the forge by hand. It stays `waiting` and visible until an operator moves the blocker.
- **A link run that ends `fold` or `dropped` starts nothing.** `fold` leaves an ask; `dropped` ends the item.
- **A work order has no stage of its own after the order.** Nothing starts when its last member lands, and nothing lands its shared branch on the base.
- **The label orders one item.** `depends_on` and `items` reach the order stage only through an order file.
- **A label orders pull requests too.** The `order-on-label` binding does not tell an issue from a pull request. See [label intake](#label-intake-a-label-is-a-work-order).
- **Nothing enters on its own.** Every item starts because an operator ordered it, by hand or with the label. Triage records whether an item could have started without asking, as a shadow; nothing uses it yet.
- **There is no shorter path for simple work.** Every item that is built goes through plan, build and the full check rounds. As of 2026-11-25 the `complexity` shadow judges how complex an item is to get right (`plain`, `ordinary` or `involved`, defined in [`.shared/complexity.md`](.shared/complexity.md)): after triage, from the item alone, with what a shorter path could skip. It starts nothing and acts on nothing; it is counted as `sf.complexity_at_triage`, to find out whether a triage-time judgment can be trusted to route an item onto a shorter path. The comparison that settles it is against outcomes: for each item, what its later check rounds actually found that a shorter path would have skipped.
- **The drain files at most three items a run.** The discoveries drain starts when a change has landed and decides what should become a work item. When the project has a tracker it creates the three most valuable there, and holds the rest; its result says where each was filed. With no tracker it writes nothing and an operator files them.
- **A split member that waits on a ruling or a signal starts only when the split runs again,** by an answer or by hand. A member that waits on another member starts by itself. The members' landing branch reaches them as `land_on`; the split does not create the branch or record it on the item.
- **Changes built side by side can conflict.** A change that was ready stops merging when a sibling lands first. The land gate names the other open changes that touch the same files and the order it would land them in; nothing brings the later one up to date before its land is refused and it goes back to its builder. (The landed check used to name such siblings as a shadow. It named one in 41 runs and missed six of seven real conflicts, so it was removed.)
- **The landing branch is enforced at the merge, not before it.** `land_on` reaches every stage, and the land stage merges only a change proposed against it: one proposed against another branch stops with an ask. Unless an operator records the branch on the item first ([landing branch](#landing-branch-and-work-that-is-part-of-a-larger-item)), the engine cuts the first worktree from the base branch, and only the build prompt moves the builder onto `land_on`. When the land stage merges through the forge, the engine records the merge and the branch on the item, so later work on the item is cut from it.
- **After a landing, one result is acted on.** When the landed check finds the change broke its branch and writes a work order, that order starts as new work on the same item. Every other result of the landed check is only recorded.
- **No screenshots in the report.** The forge has no way to attach a file.

## License

MIT
