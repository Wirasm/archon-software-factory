// The round limit of a delivery stage lives on the item. A round is one completed run of
// the stage on the item since it was last planned, and this run is the next one. The
// allowance is three, plus one for each `one-more-round` an operator chose on an ask one
// of those runs left. Both are read from the item, so nothing is stored that could
// disagree with it. Inputs: `stage`, the workflow's name; `last`, what this round ended with.
import { emit, input, item } from 'archon:script';
const stage = input('stage').trim();
const said = String(JSON.parse(input('last') || '{}')?.outcome ?? '');
const read = item();
const runs = read?.runs ?? [];
const planned = runs
  .filter(run => run.workflow === 'plan' && run.status === 'completed')
  .map(run => run.completedAt ?? '').sort().at(-1) ?? '';
const earlier = runs.filter(run => run.workflow === stage && run.status === 'completed' && run.startedAt > planned);
const round = earlier.length + 1;
const raised = (read?.answers ?? []).filter(answer =>
  answer.kind === 'ask' && answer.chosen?.id === 'one-more-round' && earlier.some(run => run.id === answer.runId)).length;
const allowance = 3 + raised;
emit({ round, allowance, state: said === 'return' && round >= allowance ? 'used_up' : 'open' });
