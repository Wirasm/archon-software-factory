import { forge, input } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const result = parse('result');
const checks = parse('checks');
const host = parse('host');
const MARKER = '<!-- software-factory:report -->';
const ENDING = '<!-- ending -->';
try {
  const change = input('change').trim();
  const where = change ? forge('resolve', { remote: change, web: true }) : null;
  if (result && checks?.report && where && where.kind === 'resolved' && where.subject?.kind === 'pr') {
    const cell = (text: unknown) => String(text ?? '').replace(/\r?\n+/g, ' ').replace(/\|/g, '\\|').trim();
    const ended: Record<string, string> = {
      ready: 'ready for a maintainer',
      returned: 'returned: the rounds ran out with findings open',
      waiting: 'waiting for the project\'s own checks',
      replan: 'needs a different approach',
      ask: 'a decision is needed',
    };
    const hostSaid: Record<string, string> = { clear: 'clear', none: 'nothing to read', return: 'findings open', ask: 'a decision is needed' };
    const asks = (result.asks ?? []).map((a: any) => `- ${cell(a.question)}`).join('\n');
    const ending = [
      '| Ended | Review rounds | The project\'s own checks and reviews |',
      '| --- | --- | --- |',
      `| ${ended[result.outcome] ?? cell(result.outcome)} | ${checks.round ?? ''} | ${host ? (hostSaid[host.outcome] ?? cell(host.outcome)) : 'not read'} |`,
      host?.summary ? `\n${String(host.summary).trim()}` : '',
      asks ? `\n**Waiting on a decision:**\n${asks}` : '',
    ].filter(Boolean).join('\n');
    const body = String(checks.report)
      .replace(/^## Factory report: .*$/m, `## Factory report: ${ended[result.outcome] ?? result.outcome}`)
      .replace(ENDING, ending);
    forge('workitem.comment.upsert', {
      subject: { kind: 'pr', ref: { repo: where.repo, number: where.subject.number } },
      marker: MARKER,
      body,
    });
    console.error(`reported: report closed on ${change} as ${result.outcome}`);
  } else {
    console.error('reported: nothing to update.');
  }
} catch (error) {
  console.error(`reported: the report was not updated: ${error instanceof Error ? error.message : String(error)}`);
}
console.log('done');
