// What one run of a delivery stage (stage-build, stage-check, stage-host) ended with, as the
// result the pack's bindings read. It computes the outcome and gives every ask the options
// the bindings name. It judges nothing.
//
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with; `change`,
// where the change is proposed; `returned`, what goes back to the builder when this run
// returns the change (in the build stage: what the builder was given, `null` on a first
// build); `next`, build stage only, the stage that looks at the change after this build;
// `checked`, host stage only, what the last check run on the item ended with; `allowed`,
// check and host stages, the round count of the `allowance` node; `exhausted`, what the
// `exhausted` node judged when the rounds are used up.
import { emit, input } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const stage = input('stage').trim();
const last = parse('last') ?? {};
const said = String(last.outcome ?? '');
const change = input('change').trim();
const given = input('returned').trim();
const returned = given === 'null' ? '' : given;
const allowed = parse('allowed');
if (stage !== 'stage-build' && !allowed) throw new Error('ending: no round count from the allowance node');
const { round, allowance } = allowed ?? {};
const usedUp = allowed?.state === 'used_up';

const outcome = usedUp ? 'ask'
  : stage === 'stage-build'
    ? (said === 'built' ? (input('next').trim() === 'host' ? 'built_for_host' : 'built') : said === 'stop' ? 'replan' : said)
  : stage === 'stage-host' ? (said === 'clear' || said === 'none' ? 'ready' : said)
  : said;
// An outcome that a binding hands on to the next stage leaves no ask.
const handsOn = ['built', 'built_for_host', 'approve', 'return', 'ready', 'waiting'].includes(outcome);

// An answer's option id decides what starts next (the pack's asks-settled bindings name
// them), so every ask offers one fixed set, written here and never by an agent. What a
// stage offered in its own words is kept in the context.
const forward = stage === 'stage-host'
  ? { id: 'take-as-is', does: 'The change stands as it is and nothing more runs. An operator lands it or closes it.', cost: 'What the host returned stays unfixed.' }
  : { id: 'take-as-is', does: 'The change goes on to the host round as it is.', cost: 'What was returned stays unfixed.' };
const replan = { id: 'replan', does: 'The item goes back to planning with what you say in your answer.', cost: 'The work so far may be discarded.' };
const hold = { id: 'hold', does: 'Nothing starts, and this ask is closed: nothing can be started from it later. To keep the item waiting, leave the ask open and answer when you know.', cost: 'The item waits.' };
const routes = usedUp
  ? [{ id: 'one-more-round', does: 'This item is allowed one more round: the same builder fixes what was returned, and it is looked at again.', cost: 'One build run and one more round.' }, forward, replan, hold]
  : [{ id: 'send-back', does: 'The same builder continues on the change with what you say in your answer, and the checks look at it again.', cost: 'One build run and one check round.' }, replan, forward, hold];
const token = (id: unknown) =>
  String(id ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'option';
const summary = String(last.summary || last.stop || '');
// Rounds used up: the question, its context and the recommendation are the `exhausted`
// node's judgment. Its recommendation names one of the options above by schema.
const judged = parse('exhausted');
const left = judged?.asks?.[0];
const asks = usedUp
  ? [{
      question: String(left?.question || 'The rounds allowed on this item are used up and the change is still returned. What should happen to it now?'),
      context: [`Round ${round} of ${allowance} allowed on this item.`, left?.context ?? summary, judged?.same_kind].filter(Boolean).join('\n\n'),
      options: routes,
      recommendation: routes.some(r => r.id === left?.recommendation?.option)
        ? { option: left.recommendation.option, why: String(left.recommendation.why ?? '') }
        : { option: 'hold', why: 'The judgment of what is left did not run, so the run does not guess a way forward.' },
      artifacts: [],
    }]
  : handsOn ? []
  : (last.asks ?? []).map((ask: any) => {
      const offered = (ask.options ?? []).map((o: any) => `- ${String(o.id ?? '')}: ${String(o.does ?? '')}${o.cost ? ` (cost: ${String(o.cost)})` : ''}`);
      const wanted = token(ask.recommendation?.option);
      const why = String(ask.recommendation?.why ?? '');
      const route = routes.some(r => r.id === wanted) ? wanted : wanted.startsWith('hold') ? 'hold' : 'send-back';
      return {
        question: String(ask.question ?? ''),
        context: [
          ask.from ? `${ask.context ?? ''} (Left by: ${ask.from}.)` : String(ask.context ?? ''),
          offered.length ? `The stage offered these, in its own words; say which in your answer:\n${offered.join('\n')}` : '',
        ].filter(Boolean).join('\n\n'),
        options: routes,
        recommendation: { option: route, why: ask.recommendation?.option ? `The stage recommends "${ask.recommendation.option}". ${why}` : why },
        artifacts: [],
      };
    });
// An ending that hands nothing on stops the item, so it always tells an operator.
if (!handsOn && asks.length === 0) {
  asks.push({
    question: 'Work on this item stopped. What should happen to the change now?',
    context: [`${stage} ended as ${outcome} and attached no question.`, summary, String(last.for_next ?? '')].filter(Boolean).join(' '),
    options: routes,
    recommendation: { option: 'hold', why: 'No stage recommended a way forward, so the run does not guess one.' },
    artifacts: [],
  });
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
    : {
        noticed: last.noticed ?? parse('checked')?.noticed ?? [],
        round,
        allowance,
        // The report on the proposed change and its running totals, for the next check
        // round and for the host stage's closing of the report.
        found: last.found, noted: last.noted, history: last.history, report: last.report,
      }),
  asks,
  metrics: outcome === 'ready' ? [count('sf.ended_ready', 'runs', 1)] : [],
});
