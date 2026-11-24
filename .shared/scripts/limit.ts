// Two facts about this run of a delivery stage, read from the item, so nothing is stored
// that could disagree with it.
// `round`: which run of the stage on the item this is since it was last planned, for the
// report and the round metrics.
// `state`: `used_up` when the binding this run's outcome would start has no starts left on
// the item (the binding's `limit` in .pack/pack.yaml, counted by the engine). The engine
// refuses such a start and tells nobody, so the stage ends in an ask instead.
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with;
// `limits`, JSON from an outcome of that agent to the id of the limited binding it starts.
import { emit, input, item, runId } from 'archon:script';
const read = item();
// A run's `pack.workflow` is the stage's own name whether the pack is in the project or
// installed. Another pack's runs on the item can share a name, so the pack must match too.
const own = (read?.runs ?? []).find(run => run.id === runId())?.pack;
const done = (read?.runs ?? []).filter(run => run.status === 'completed' && run.pack?.key === own?.key);
const planned = done.filter(run => run.pack?.workflow === 'plan').map(run => run.completedAt ?? '').sort().at(-1) ?? '';
const round = done.filter(run => run.pack?.workflow === input('stage').trim() && run.startedAt > planned).length + 1;
const said = String(JSON.parse(input('last') || '{}')?.outcome ?? '');
const binding: string | undefined = JSON.parse(input('limits'))[said];
// The engine names a limit after its binding, `<pack>-<repository>-<binding id>-<digest>`,
// with a digest of twelve characters. A limit no start has counted under yet is not listed.
const limit = binding ? (read?.startLimits ?? []).find(l => l.name.slice(0, -13).endsWith(`-${binding}`)) : undefined;
emit({ round, state: limit?.left === 0 ? 'used_up' : 'open' });
