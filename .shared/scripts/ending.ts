// What one run of a delivery stage (stage-build, stage-check, stage-host) ended with, as the
// result the pack's bindings read. It computes the outcome, counts the stage's rounds on
// the item against the item's allowance, and gives every ask the options the bindings
// name. It judges nothing.
//
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with; `change`,
// where the change is proposed; `returned`, what goes back to the builder when this run
// returns the change (in the build stage: what the builder was given, `null` on a first
// build); `next`, build stage only, the stage that looks at the change after this build;
// `checked`, host stage only, what the last check run on the item ended with.
import { emit, input, item } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const stage = input('stage').trim();
const last = parse('last') ?? {};
const said = String(last.outcome ?? '');
const change = input('change').trim();
const given = input('returned').trim();
// What goes back to the builder names the change, so the builder continues that one and
// opens no second. The build stage hands on what it was given as it got it.
const returned = stage === 'stage-build'
  ? (given === 'null' ? '' : given)
  : [change ? `The change is proposed at ${change}` : '', given].filter(Boolean).join('\n\n');

// The round limit lives on the item. A round is one completed run of this stage on the
// item since it was last planned, and this run is the next one. The allowance is three,
// plus one for each `one-more-round` an operator chose on an ask one of those runs left.
// Both are read from the item, so nothing is stored that could disagree with it.
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
const usedUp = stage !== 'stage-build' && said === 'return' && round >= allowance;

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
const hold = { id: 'hold', does: 'Nothing proceeds until an operator says more.', cost: 'The item waits.' };
const routes = usedUp
  ? [{ id: 'one-more-round', does: 'This item is allowed one more round: the same builder fixes what was returned, and it is looked at again.', cost: 'One build run and one more round.' }, forward, replan, hold]
  : [{ id: 'send-back', does: 'The same builder continues on the change with what you say in your answer, and the checks look at it again.', cost: 'One build run and one check round.' }, replan, forward, hold];
const token = (id: unknown) =>
  String(id ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'option';
const summary = String(last.summary || last.stop || '');
const asks = usedUp
  ? [{
      question: 'The rounds allowed on this item are used up and the change is still returned. What should happen to it now?',
      context: `Round ${round} of ${allowance} allowed on this item (${stage}). ${summary}`.trim(),
      options: routes,
      recommendation: { option: 'hold', why: 'No stage judged which way forward is right, so the run does not guess one.' },
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
    : { noticed: last.noticed ?? parse('checked')?.noticed ?? [], round, allowance }),
  asks,
  metrics: [
    ...(stage === 'stage-check' ? [count('sf.review_rounds', 'rounds', round)] : []),
    ...(outcome === 'ready' ? [count('sf.ended_ready', 'runs', 1)] : []),
  ],
});
