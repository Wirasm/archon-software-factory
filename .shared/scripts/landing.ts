// What one run of a landing stage (landgate, land) ended with, as the result the pack's
// bindings read. It maps the agent's ending to the outcome the bindings route on and
// passes the asks along. It judges nothing. The options of an ask are the stage's
// `returns.options`. The merge and the landing branch are recorded on the item by the
// engine, when the land stage's `archon forge pr.merge` is applied.
//
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with; `change`,
// where the change is proposed; `delivered`, gate only, what the host round ended with; `land_gate`, gate only, the pack
// setting of that name; `noticed`, land only, what the checks noticed, carried to the
// discoveries drain that starts when the change has landed.
import { emit, input } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const stage = input('stage').trim();
const last = parse('last') ?? {};
const change = input('change').trim();
const gate = stage === 'landgate';

// The gate's judgment under the land policy, and the one switch that decides whether it is
// acted on: with `land_gate: policy` a change the policy lets land starts the land stage.
// With anything else the gate is a shadow: it asks every time and records the judgment.
const would = gate ? (last.land === 'auto' ? 'land' : 'ask') : '';
const shadow = gate && input('land_gate').trim() !== 'policy';
const outcome = gate ? (shadow ? 'ask' : would) : String(last.outcome ?? '');
// An outcome that a binding hands on to the next stage leaves no ask.
const handsOn = ['land', 'landed', 'behind', 'returned'].includes(outcome);
const summary = String(gate ? last.why ?? '' : last.summary || last.stop || '');
const shadowed = !shadow ? ''
  : would === 'land' ? `Shadow: the land policy would have landed this without asking (${String(last.criterion ?? '')}). ${summary}`
  : `Shadow: the land policy would have asked, because: ${summary || String(last.criterion ?? '')}`;

// An ask as the engine takes it. The stage names no option with `none` and says why it
// cannot choose; that reason goes in the recommendation's place (`option: null`).
const ask = (question: unknown, context: unknown, option: string, why: unknown) => ({
  question: String(question ?? ''),
  context: [context, shadowed]
    .map(part => String(part ?? '').trim()).filter(Boolean).join('\n\n'),
  recommendation: option ? { option, why: String(why ?? '') } : { option: null, why: String(why ?? '').trim() || 'the stage gave no reason.' },
  artifacts: [],
});
const asks = handsOn ? [] : (last.asks ?? []).map((written: any) => {
  const wanted = String(written.recommendation?.option ?? '');
  return ask(written.question, written.context, wanted === 'none' ? '' : wanted, written.recommendation?.why);
});
// An ending that hands nothing on stops the item, so it always tells an operator.
if (!handsOn && asks.length === 0) {
  asks.push(ask(
    gate ? 'This change is ready. May it land?' : 'Landing this change stopped. What should happen to it now?',
    [`${stage} ended as ${outcome} and attached no question.`, shadow ? '' : summary, String(last.for_next ?? '')].filter(Boolean).join(' '),
    '',
    'the stage left no question, so no judgment of the options exists.',
  ));
}

const said = [last.returned, last.stop, gate ? last.why : ''].map(text => String(text ?? '').trim()).filter(Boolean).join('\n\n');
emit({
  ...last,
  outcome,
  change,
  summary,
  // What the builder gets when the change goes back: from the land stage, or from an
  // operator who answered `send-back`, whose answer the builder is given beside it.
  returned: outcome === 'land' || outcome === 'landed' ? '' : outcome === 'behind' ? [
    `The change is proposed at ${change}`,
    `It was approved and is sound, but its landing branch moved and it no longer merges:\n\n${said}`,
    'Merge the landing branch into the change\'s branch and resolve the conflicts. Change nothing else: what was approved is the change as it is, and anything more sends it through the host round and the land gate again. Do not rebase and do not force-push. Commit the merge and push it to where the change is proposed.',
  ].join('\n\n') : [
    `The change is proposed at ${change}`,
    gate ? `The land gate asked an operator, who sent it back. What the gate said:\n\n${said}` : `It did not land:\n\n${said}`,
    'Commit on the same branch and push it to where the change is proposed, so the host looks again.',
  ].join('\n\n'),
  noticed: (gate ? parse('delivered')?.noticed : parse('noticed')) ?? [],
  // Gate only. `would` is what the land policy decided; `shadow` says nothing acted on it.
  ...(gate ? { would, shadow, metrics: [{ name: 'sf.landgate_would_land', unit: 'changes', subject: change || null, kind: 'count', value: would === 'land' ? 1 : 0 }] } : {}),
  asks,
});
