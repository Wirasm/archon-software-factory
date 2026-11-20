import { execFileSync } from 'node:child_process';
import { emit, forge, input, runId } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const verdict = JSON.parse(input('verdict'));
const review = parse('review');
const fix = parse('fix');
const earlier = parse('earlier') ?? {};
const findings = verdict.findings ?? [];
const notes = verdict.notes ?? [];
const round = (earlier.round ?? 0) + 1;
const found = (earlier.found ?? 0) + findings.length;
const noted = (earlier.noted ?? 0) + notes.length;

// The report: one comment where the change is proposed, replaced after every round.
const cell = (text: unknown) => String(text ?? '').replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();
const short = (text: unknown, max = 140) => { const s = cell(text); return s.length > max ? `${s.slice(0, max - 1)}…` : s; };
const claim = (text: unknown) => short(text, 90).replace(/[.:]$/, '');
const table = (head: string[], rows: string[][]) =>
  [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.join(' | ')} |`)].join('\n');
const fold = (title: string, body: string) => `<details>\n<summary>${title}</summary>\n\n${body}\n\n</details>`;
const results: Record<string, string> = {
  approve: 'approve',
  return: `changes needed (${findings.length})`,
  replan: 'needs a different approach',
  ask: 'a decision is needed',
};
const did = round === 1
  ? 'First build.'
  : fix
    ? `${short(fix.summary, 200)}${(fix.disputed ?? []).length ? ` Disputed: ${(fix.disputed ?? []).length}.` : ''}`
    : 'Nothing was returned.';
const history = [...(earlier.history ?? []), {
  round, result: results[verdict.outcome] ?? verdict.outcome, found: findings.length, notes: notes.length, did,
  items: findings.map((f: any) => `\`${cell(f.where)}\` ${short(f.what, 200)}`),
}];
const MARKER = '<!-- software-factory:report -->';
const ENDING = '<!-- ending -->';
const parts: string[] = [];
parts.push(`## Factory report: round ${round}, ${results[verdict.outcome] ?? verdict.outcome}`);
parts.push(ENDING);
parts.push(String(verdict.summary ?? '').trim());
parts.push('### Rounds');
parts.push(table(['Round', 'Result', 'To change', 'Notes', 'What the builder did before this round'],
  history.map((h: any) => [String(h.round), h.result, String(h.found), String(h.notes), h.did])));
const foundBefore = history.filter((h: any) => h.round < round && (h.items ?? []).length);
if (foundBefore.length) {
  parts.push(fold('What earlier rounds returned', foundBefore
    .map((h: any) => `**Round ${h.round}**\n\n${h.items.map((x: string) => `- ${x}`).join('\n')}`).join('\n\n')));
}
if (findings.length) {
  parts.push('### Still to change');
  parts.push(table(['#', 'Where', 'What', 'Cost to leave'], findings.map((f: any, i: number) => [
    String(i + 1), `\`${cell(f.where)}\``, short(f.what, 220), short(f.cost_to_leave, 160),
  ])));
  parts.push(fold('Evidence for each', findings.map((f: any, i: number) => `**${i + 1}.** ${String(f.evidence ?? '').trim()}`).join('\n\n')));
}
const lines = review?.item_lines ?? [];
if (lines.length) {
  const said: Record<string, string> = { met: 'met', not_met: 'not met', not_checked: 'not checked' };
  const how: Record<string, string> = { ran: 'ran it', read: 'read the code', none: 'not checked' };
  parts.push('### What the item asks for');
  parts.push(table(['Asked', 'Result', 'Checked by'], lines.map((l: any) => [
    claim(l.line), said[l.verdict] ?? cell(l.verdict), how[l.evidence] ?? cell(l.evidence),
  ])));
  parts.push(fold('How each was checked', lines.map((l: any) => `- **${claim(l.line)}**: ${String(l.how ?? '').trim()}`).join('\n')));
}
if (notes.length) {
  parts.push('### Notes (these do not hold the change)');
  parts.push(table(['Where', 'Note'], notes.map((n: any) => [`\`${cell(n.where)}\``, short(n.what, 240)])));
}
parts.push('<sub>Written by the software factory after each review round: a code review, a test check and a product review of the change, then one sorting of what they found. Findings are also on their lines below.</sub>');
const report = `${MARKER}\n${parts.join('\n\n')}`;

try {
  const change = input('change').trim();
  const where = change ? forge('resolve', { remote: change, web: true }) : null;
  if (where && where.kind === 'resolved' && where.subject?.kind === 'pr') {
    const ref = { repo: where.repo, number: where.subject.number };
    forge('workitem.comment.upsert', { subject: { kind: 'pr', ref }, marker: MARKER, body: report });
    // Findings and notes go on their lines, as one review a round.
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const by = (f: any) => `Reported by: ${(f.reported_by ?? []).join(', ')}`;
    const all = [
      ...findings.map((f: any) => ({ f, body: `**Must change.** ${f.what}\n\n${f.evidence}\n\nCost to leave: ${f.cost_to_leave}\n\n${by(f)}` })),
      ...notes.map((f: any) => ({ f, body: `**Note, does not hold the change.** ${f.what}\n\n${f.evidence}\n\n${f.why_a_note}\n\n${by(f)}` })),
    ];
    const onLine = all.filter(({ f }) => f.path && Number.isInteger(f.line) && f.line > 0);
    if (onLine.length) {
      forge('pr.review.submit', {
        ref,
        commit,
        key: `${runId()}:${commit}`,
        summary: `Factory review, round ${round}: ${findings.length} to change, ${notes.length} notes. The factory report on this pull request has the whole picture.`,
        comments: onLine.map(({ f, body }) => ({ path: f.path, line: f.line, body })),
      });
    }
    console.error(`shown: report updated on ${change} (round ${round}), ${onLine.length} on their lines`);
  } else {
    console.error('shown: the change is proposed nowhere a report can be posted; nothing posted.');
  }
} catch (error) {
  console.error(`shown: the report was not posted: ${error instanceof Error ? error.message : String(error)}`);
}

// Records for `archon metrics`. The latest record per change wins, so each round
// carries the running totals: after the last round they are the change's totals.
// The verdict goes on unchanged beside them.
const subject = (input('change').trim() || null);
const count = (name: string, unit: string, value: number) => ({ name, unit, subject, kind: 'count', value });
emit({
  ...verdict,
  round,
  found,
  noted,
  history,
  report,
  metrics: [
    count('sf.review_rounds', 'rounds', round),
    count('sf.findings', 'findings', found),
    count('sf.notes', 'notes', noted),
  ],
});
