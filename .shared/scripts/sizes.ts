// How big the change was at the end of each delivery run on the item since it was last
// planned, and now, against the commit it is built on. Read from the item's runs and git, so
// the verdict and the exhausted ask state a fact instead of measuring it themselves.
// Temporary: the engine is to report a change's size per run (issue 6261); delete this then.
// Input: `base`, the commit the change is built on.
import { emit, input, item, runId } from 'archon:script';

const base = input('base').trim();
const size = (commit: string) => {
  const git = Bun.spawnSync(['git', 'diff', '--numstat', `${base}...${commit}`]);
  if (git.exitCode !== 0) return { files: null, added: null, removed: null, error: git.stderr.toString().trim() };
  const rows = git.stdout.toString().split('\n').filter(Boolean).map(row => row.split('\t'));
  // A binary file shows `-` for both counts; it counts as a file and adds no lines.
  const sum = (i: number) => rows.reduce((n, row) => n + (Number(row[i]) || 0), 0);
  return { files: rows.length, added: sum(0), removed: sum(1), error: '' };
};

const read = item();
const own = (read?.runs ?? []).find(run => run.id === runId())?.pack;
const done = (read?.runs ?? []).filter(run => run.status === 'completed' && run.pack?.key === own?.key);
const planned = done.filter(run => run.pack?.workflow === 'plan').map(run => run.completedAt ?? '').sort().at(-1) ?? '';
const runs = done
  .filter(run => run.pack?.workflow?.startsWith('stage-') && run.startedAt > planned && run.resultCommit)
  .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  .map(run => ({ workflow: run.pack?.workflow ?? '', outcome: run.outcome ?? '', commit: run.resultCommit ?? '', ...size(run.resultCommit ?? '') }));

emit({ base, runs, now: { commit: 'HEAD', ...size('HEAD') } });
