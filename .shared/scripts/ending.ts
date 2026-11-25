// What one run of a delivery stage (stage-build, stage-check, stage-host) ended with, as the
// result the pack's bindings read. It maps the agent's ending to the outcome the bindings
// route on, passes the asks along, and writes the round metrics. It judges nothing. The
// options of an ask are the stage's `returns.options`; no ask written here carries any.
//
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with; `change`,
// where the change is proposed; `returned`, what goes back to the builder when this run
// returns the change (in the build stage: what the builder was given, `null` on a first
// build); `next`, build stage only, the stage that looks at the change after this build;
// `checked`, host stage only, what the last check run on the item ended with; `limit`, the
// `limit` node's round and whether the start this ending needs is used up; `exhausted`,
// check and host stages, what the `exhausted` node judged when the rounds are used up.
import { emit, input } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const stage = input('stage').trim();
const last = parse('last') ?? {};
const said = String(last.outcome ?? '');
const change = input('change').trim();
const given = input('returned').trim();
const returned = given === 'null' ? '' : given;
const { round, state } = parse('limit') ?? {};
// The binding this ending would start has no starts left on the item, so it ends in an ask.
const usedUp = state === 'used_up';

const outcome = usedUp ? 'ask'
  : stage === 'stage-build'
    ? (said === 'built' ? ({ host: 'built_for_host', land: 'built_for_land' }[input('next').trim()] ?? 'built') : said === 'stop' ? 'replan' : said)
  : stage === 'stage-host' ? (said === 'clear' || said === 'none' ? 'ready' : said)
  : said;
// An outcome that a binding hands on to the next stage leaves no ask.
const handsOn = ['built', 'built_for_host', 'built_for_land', 'approve', 'return', 'replan', 'ready', 'waiting'].includes(outcome);
const summary = String(last.summary || last.stop || '');

// An ask as the engine takes it. One with no recommendation carries the reason in the
// recommendation's place (`option: null`), and the engine shows it there.
const ask = (question: unknown, context: unknown[], option: string, why: unknown) => ({
  question: String(question ?? ''),
  context: context.map(part => String(part ?? '').trim()).filter(Boolean).join('\n\n'),
  recommendation: option
    ? { option, why: String(why ?? '') }
    : { option: null, why: String(why ?? '').trim() || 'the stage gave no reason.' },
  artifacts: [],
});
// The option ids every delivery stage declares. An ask a check, the builder or the host
// wrote has options in its own words, which are kept in the context: one that names one of
// these ids is that route, and any other is something the builder carries out, so it is a
// `send-back`. The engine refuses a recommendation that names no declared option.
const routes = ['send-back', 'replan', 'take-as-is', 'drop', 'reshape'];
const own = (written: any) => {
  const offered = (written.options ?? []).map((o: any) => `- ${String(o.id ?? '')}: ${String(o.does ?? '')}${o.cost ? ` (cost: ${String(o.cost)})` : ''}`);
  const wanted = String(written.recommendation?.option ?? '').trim();
  const why = String(written.recommendation?.why ?? '');
  return ask(
    written.question,
    [
      written.from ? `${written.context ?? ''} (Left by: ${written.from}.)` : written.context,
      offered.length ? `The stage offered these, in its own words; say which in your answer:\n${offered.join('\n')}` : '',
    ],
    routes.includes(wanted) ? wanted : 'send-back',
    wanted && !routes.includes(wanted) ? `The stage recommends "${wanted}". ${why}` : why,
  );
};
// Rounds used up: the question, its context and the recommendation are the `exhausted`
// node's judgment. It names a declared option by schema, or `none`.
const judged = parse('exhausted');
const left = judged?.asks?.[0];
const asks = left
  ? [ask(left.question, [`Round ${round}: the rounds this item is allowed without an operator are used up.`, left.context, judged.same_kind],
      left.recommendation?.option === 'none' ? '' : String(left.recommendation?.option ?? ''), left.recommendation?.why)]
  : handsOn ? [] : (last.asks ?? []).map(own);
// An ending that hands nothing on stops the item, so it always tells an operator.
if (!handsOn && asks.length === 0) {
  asks.push(ask(
    'Work on this item stopped. What should happen to the change now?',
    [[`${stage} ended as ${usedUp ? said : outcome} and attached no question.`,
      usedUp ? 'That ending has started its next stage on this item as often as it may without an operator.' : '',
      ...new Set([summary, String(last.stop ?? ''), String(last.for_next ?? '')])].filter(Boolean).join(' ')],
    '',
    'the stage left no question, so no judgment of the options exists.',
  ));
}

const count = (name: string, unit: string, value: number) => ({ name, unit, subject: change || null, kind: 'count', value });
emit({
  outcome,
  change,
  summary,
  for_next: String(last.for_next ?? ''),
  returned,
  ...(stage === 'stage-build'
    // What the builder says it did about what it was given; nothing on a first build.
    ? { reply: returned ? input('last') : '' }
    : { noticed: last.noticed ?? parse('checked')?.noticed ?? [], round }),
  asks,
  metrics: [
    ...(outcome === 'ready' ? [count('sf.ended_ready', 'runs', 1)] : []),
    // One check round, as records for `archon metrics`: how many rounds the change has had
    // (latest wins per change), and what this round found (one record per round, so the
    // metric's sum is everything found and nothing is counted across runs here).
    ...(stage === 'stage-check' && change ? [
      count('sf.review_rounds', 'rounds', round),
      { ...count('sf.round_findings', 'findings', (last.findings ?? []).length), subject: `${change}#round-${round}` },
      { ...count('sf.round_notes', 'notes', (last.notes ?? []).length), subject: `${change}#round-${round}` },
    ] : []),
  ],
});
