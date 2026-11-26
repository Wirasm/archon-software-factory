# Changing this pack

## The two branches

- **`main` is what operators get.** `archon plugin add` installs the default branch, so `main` must always work on the latest released Archon. An operator on a released binary must never get a workflow that uses something their Archon lacks.
- **`dev` is where pack work happens,** against Archon's own `dev` branch. A change that needs an unreleased engine feature lands on `dev` only.
- **At each Archon release,** `dev` is merged into `main` the same day, and `main` is tagged with the Archon version it matches (`v0.15.0`, `v0.15.1`, ...), so an install can pin a tag: `archon plugin add <owner>/archon-software-factory@v0.15.0`.
- **A fix that works on the released Archon** (a prompt, a README line, a manifest fix) may go to `main` directly and is then merged into `dev`.

Pull requests target `dev`, unless the change is such a fix.

## Running the `dev` branch

`archon plugin add` installs the default branch or a tag, not a branch. To run `dev`, clone the repository, check out `dev`, and give the folder as the source wherever a command takes one:

```bash
archon validate workflows --workflow-source <the clone>
archon pack bindings archon-software-factory --workflow-source <the clone> --repo <host>/<owner>/<name> --host <host-id> --run-as <user-id> --cwd <the project's checkout> --out <bindings-dir>
```

The generated bindings then start every stage from that folder. Keep the folder still while runs are in flight: copy the clone to a second folder, point the bindings at the copy, and update the copy at a quiet moment under `archon hold set`.

## Proving a change

- **Every change:** `archon validate workflows --workflow-source <your clone>` reports no errors, and `archon pack bindings` writes its files with no refusal. Every binding in `.pack/pack.yaml` names a workflow that `archon-plugin.json` lists; a stage that is not listed cannot be bound.
- **A change to a prompt or a stage:** run that stage by hand on a scratch item (`archon workflow run <stage> --item <a scratch key> --workflow-source <your clone>`) and read what it returned. End the scratch item afterwards with `archon workflow end --item <key> -- scratch`.
- **Before anything reaches `main`:** prove it the way a new operator installs. A scratch Archon home, the released binary, `archon plugin add` from GitHub, `archon skill add --pack`, and `archon pack bindings` on a real repository. An install that loads the pack from a folder does not show what a clean install shows: a manifest that missed one stage passed every check on a folder install and failed on the first clean one.

## How the pack is written

- **A stage starts as a prompt with a typed result.** Add a script or a check only after a real run failed in a way the agent could not handle. A script reads facts and acts at a boundary; it does not judge.
- **The engine coordinates.** Waiting, linking, limits, queues and what follows what are bindings in `.pack/pack.yaml`, not scripts in a stage.
- **Prompts are generic.** No project, forge, provider or model is named in a prompt. What a project wants goes in its policy files (`policy/` holds the defaults).
- **A new judgment runs as a shadow first.** It records what it would have done and nothing acts on it, until it has been compared with what happened. The README's "What is not there yet" lists the shadows.
- **Docs your change makes untrue are part of the change:** the README, `how-it-works.md` with its `groups:` header, and the skill in `skill/`.

`evals/` holds the cases and logs the prompts were tuned against, including `evals/overrules/log.md`: each time an operator overruled a stage's verdict, with why. Add to it when you overrule one.
