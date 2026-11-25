// How big the change was at the end of each delivery run on the item since it was last
// planned, as the engine recorded it for each run, so the verdict and the exhausted ask
// state a fact instead of measuring it themselves. Reads the item; runs no git.
import { emit, item, runId } from 'archon:script';

const read = item();
const own = (read?.runs ?? []).find(run => run.id === runId())?.pack;
const done = (read?.runs ?? []).filter(run => run.status === 'completed' && run.pack?.key === own?.key);
const planned = done.filter(run => run.pack?.workflow === 'plan').map(run => run.completedAt ?? '').sort().at(-1) ?? '';
const runs = done
  .filter(run => run.pack?.workflow?.startsWith('stage-') && run.startedAt > planned)
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  // `size` is null when the engine could not measure the run's change, never zeros.
  .map(run => ({ workflow: run.pack?.workflow ?? '', outcome: run.outcome ?? '', size: run.changeSize ?? null }));

emit({ runs });
