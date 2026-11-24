// Two facts about this run of a delivery stage, read from the item, so nothing is stored
// that could disagree with it.
// `round`: which run of the stage on the item this is since it was last planned, for the
// report and the round metrics.
// `state`: `used_up` when the binding this run's outcome would start has no starts left on
// the item (the binding's `limit` in .pack/pack.yaml, counted by the engine). The engine
// refuses such a start and lists the item as stopped; the stage ends in an ask instead, so
// the operator gets options and an answer can grant one more round.
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with;
// `ends_as`, JSON from an ending of that agent to the outcome the run returns for it, for
// the endings where the two differ.
import { emit, input, item, runId } from 'archon:script';
const read = item();
// A run's `pack.workflow` is the stage's own name whether the pack is in the project or
// installed. Another pack's runs on the item can share a name, so the pack must match too.
const mine = (read?.runs ?? []).find(run => run.id === runId());
const own = mine?.pack;
const done = (read?.runs ?? []).filter(run => run.status === 'completed' && run.pack?.key === own?.key);
const planned = done.filter(run => run.pack?.workflow === 'plan').map(run => run.completedAt ?? '').sort().at(-1) ?? '';
const round = done.filter(run => run.pack?.workflow === input('stage').trim() && run.startedAt > planned).length + 1;
const said = String(JSON.parse(input('last') || '{}')?.outcome ?? '');
const outcome = JSON.parse(input('ends_as') || '{}')[said] ?? said;
// Each limit on the item names the bindings it counts for, by the run end that starts
// them. A limit no start has counted under yet is not listed, and has starts left.
const limit = (read?.startLimits ?? []).find(l =>
  l.bindings?.some(b => b.runEnded?.workflowName === mine?.workflow && b.runEnded.outcome === outcome));
emit({ round, state: limit?.left === 0 ? 'used_up' : 'open' });
