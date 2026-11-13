# Targets and baseline

Carried from [Archon issue 4438](https://github.com/coleam00/Archon/issues/4438), the tracker for cutting the old SDLC pack back. That lane ended on 2026-11-13 when the pack's successor moved to this repo. The targets still stand. The factory is judged on them, not on lines of code.

## Targets (ruled 2026-11-11)

| Target | Measure | Old pack, 2026-11-10 |
|---|---|---|
| The engine owns as much as possible and the pack is as small as possible | Hand-written script lines; each script names the boundary it guards | about 11,400 lines, 42% boundary work |
| No loss in outcome quality | Merge rate, abandoned pull requests, review bench catch rate | 0.98, 7 of 390, 21 of 26 |
| Fewer than 2 review rounds to merge, on average | Review rounds per merged item | 2.91 |
| Lower wall clock the simpler an item is, while novel work is still handled | Hours from intake to ready, and from ready to merge, by size | Intake to ready: median 1.60. Ready to merge: median 1.19. Intake to merge by size s / m / l: 4.0 / 4.0 / 4.2, no difference. One-round items 2.55, two or more rounds 12.6 |
| Asks reach the attention watch with a recommendation | Share of asks with a recommendation; asks per merged item; answers that were "something else" | 18 of 365; 0.67; 30 of 362 |

The baseline covers 390 merged issues over 30 days: median 4.0 hours from intake to merge and 365 asks to a person. Its source is [this comment](https://github.com/coleam00/Archon/issues/4438#issuecomment-6780674631).

## Workshop, 2026-12-02

By then the factory should:

1. be easy to show in numbers;
2. produce good outcomes;
3. be easy to set up with your own agent, and to configure;
4. have an attention manager agent on top of the attention watch;
5. have sensible schedules and bindings for automation;
6. take a work order, a group of work items, and land it on a target the user names: a release, staging or feature branch, or the default branch.

## Later measurements of the old pack

A dogfood run on 2026-11-12 merged 20 of 20 items. Median time from ready to merged fell from 71 to 14.5 minutes by removing waits, not rounds. 15 of 40 follow-up starts were dropped by a busy queue. These are the numbers the new factory has to beat on the same kind of work.
