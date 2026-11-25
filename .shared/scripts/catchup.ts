// Is the change, after its builder brought it up to date with its landing branch, the same
// change that was approved? Compares the lines the change adds and removes against the
// landing branch, before and after, file by file. Context lines are left out: a merge moves
// them and changes nothing the change does. It judges nothing: equal or not, and which
// files differ.
//
// "Before" is the commit the land stage's last run on this item ended on, read from the
// item. Input: `onto`, the landing branch as a ref.
import { emit, input, item, runId } from 'archon:script';

const onto = input('onto').trim();
const git = (...args: string[]) => {
  const ran = Bun.spawnSync(['git', ...args]);
  return { ok: ran.exitCode === 0, out: ran.stdout.toString(), err: ran.stderr.toString().trim() };
};
// The lines a head adds and removes on top of the landing branch, as `file\t+line` entries.
const own = (head: string) => {
  const base = git('merge-base', head, onto);
  if (!base.ok) return { error: `no common commit of ${head} and ${onto}: ${base.err}` };
  const diff = git('diff', '--no-color', '--no-ext-diff', '-U0', base.out.trim(), head);
  if (!diff.ok) return { error: diff.err };
  const lines: string[] = [];
  let file = '';
  for (const line of diff.out.split('\n')) {
    if (line.startsWith('diff --git ')) file = line.slice(11).split(' b/').pop() ?? '';
    else if (line.startsWith('+++ ') || line.startsWith('--- ') || line.startsWith('@@') || line.startsWith('index ')) continue;
    else if (line.startsWith('+') || line.startsWith('-') || line.startsWith('Binary files ')) lines.push(`${file}\t${line}`);
    // Mode changes, renames and new or deleted files are part of the change too.
    else if (/^(old mode|new mode|new file mode|deleted file mode|rename from|rename to) /.test(line)) lines.push(`${file}\t${line}`);
  }
  return { lines: lines.sort() };
};

const read = item();
const mine = (read?.runs ?? []).find(run => run.id === runId())?.pack;
const before = (read?.runs ?? [])
  .filter(run => run.status === 'completed' && run.pack?.key === mine?.key && run.pack?.workflow === 'land' && run.resultCommit)
  .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
  .at(-1)?.resultCommit ?? '';
const after = git('rev-parse', 'HEAD').out.trim();

const was = before ? own(before) : { error: 'no land run with a commit on this item' };
const is = own('HEAD');
if ('error' in was || 'error' in is) {
  emit({ same: false, before, after, onto, differs: [], why: String(('error' in was && was.error) || ('error' in is && is.error)) });
} else {
  const count = (list: string[]) => list.reduce((seen, line) => seen.set(line, (seen.get(line) ?? 0) + 1), new Map<string, number>());
  const a = count(was.lines), b = count(is.lines);
  const differs = [...new Set([...a.keys(), ...b.keys()])].filter(line => a.get(line) !== b.get(line)).map(line => line.split('\t')[0]);
  const files = [...new Set(differs)];
  emit({
    same: files.length === 0 && before !== after,
    before, after, onto,
    differs: files,
    why: before === after ? 'the builder pushed nothing: the head is the one the land stage read'
      : files.length ? `${files.length} file(s) add or remove other lines than before: ${files.slice(0, 8).join(', ')}` : 'the same lines are added and removed',
  });
}
