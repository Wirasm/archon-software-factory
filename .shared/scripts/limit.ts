// Two facts about this run of a delivery stage, read from the item, so nothing is stored
// that could disagree with it.
// `round`: which run of the stage on the item this is since it was last planned, for the
// report and the round metrics.
// `state`: `used_up` when the binding this run's outcome would start has no starts left on
// the item (the binding's `limit` in .pack/pack.yaml, counted by the engine). The engine
// refuses such a start and tells nobody, so the stage ends in an ask instead.
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with;
// `limits`, JSON from an outcome of that agent to the id of the limited binding it starts.
import { emit, input, item } from 'archon:script';
// On a pack installed with `archon plugin add`, a run's workflow is the namespaced name
// (`<owner>/<pack>:stage-check`); in a project's own copy it is bare. Compare the last part.
const bare = (name: string) => name.slice(name.lastIndexOf(':') + 1);
const read = item();
const done = (read?.runs ?? []).filter(run => run.status === 'completed');
const planned = done.filter(run => bare(run.workflow) === 'plan').map(run => run.completedAt ?? '').sort().at(-1) ?? '';
const round = done.filter(run => bare(run.workflow) === bare(input('stage').trim()) && run.startedAt > planned).length + 1;
const said = String(JSON.parse(input('last') || '{}')?.outcome ?? '');
const binding: string | undefined = JSON.parse(input('limits'))[said];
// The engine names a limit after its binding, `<pack>-<repository>-<binding id>-<digest>`,
// with a digest of twelve characters. A limit no start has counted under yet is not listed.
const limit = binding ? (read?.startLimits ?? []).find(l => l.name.slice(0, -13).endsWith(`-${binding}`)) : undefined;
emit({ round, state: limit?.left === 0 ? 'used_up' : 'open' });
