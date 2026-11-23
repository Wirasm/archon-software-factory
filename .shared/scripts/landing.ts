// What one run of a landing stage (landgate, land) ended with, as the result the pack's
// bindings read. It computes the outcome, gives every ask the options the bindings name,
// and, after a merge, records on the item what the host says landed. It judges nothing.
//
// Inputs: `stage`, the workflow's name; `last`, what the stage's agent ended with; `change`,
// where the change is proposed; `land_on`, the item's landing branch (land stage only);
// `delivered`, gate only, what the host round ended with; `noticed`, land only, what the
// checks noticed, carried to the discoveries drain that starts when the change has landed.
import { emit, forge, input, item } from 'archon:script';
const parse = (name: string) => { try { return JSON.parse(input(name) || 'null'); } catch { return null; } };
const stage = input('stage').trim();
const last = parse('last') ?? {};
const change = input('change').trim();
const gate = stage === 'landgate';

const outcome = gate ? (last.land === 'auto' ? 'land' : 'ask') : String(last.outcome ?? '');
// An outcome that a binding hands on to the next stage leaves no ask.
const handsOn = ['land', 'landed', 'returned'].includes(outcome);
const summary = String(gate ? last.why ?? '' : last.summary || last.stop || '');

// An answer's option id decides what starts next (the pack's asks-settled bindings name
// them), so every ask offers one fixed set, written here and never by an agent.
const routes = [
  { id: 'land', does: 'The land stage merges the change into its landing branch, when it still merges and its checks are green.', cost: 'The change is on the branch everyone builds on.' },
  { id: 'send-back', does: 'The same builder continues on the change with what you say in your answer, and the checks look at it again.', cost: 'One build run and one check round before it can land.' },
  { id: 'drop', does: 'The change is closed without merging and the item ends here. Your answer is written on the change as the reason.', cost: 'The work on this change is given up; its branch stays.' },
  { id: 'reshape', does: 'The change stays open as a draft and nothing more is built until the item is shaped again. Your answer is written on the change.', cost: 'The item waits for shaping, and the draft can stop merging while it does.' },
];
// An ask with no recommendation says why in its context: the engine keeps a reason only
// beside a recommended option.
const unrecommended = (why: unknown) => `No recommendation: ${String(why ?? '').trim() || 'the stage gave no reason.'}`;
const asks = handsOn ? [] : (last.asks ?? []).map((ask: any) => {
  const wanted = String(ask.recommendation?.option ?? '');
  // The stage names no option of this ask with `none`, and says why it cannot choose.
  const recommends = routes.some(r => r.id === wanted);
  return {
    question: String(ask.question ?? ''),
    context: [String(ask.context ?? ''), recommends ? '' : unrecommended(ask.recommendation?.why)].filter(Boolean).join('\n\n'),
    options: routes,
    recommendation: recommends ? { option: wanted, why: String(ask.recommendation?.why ?? '') } : null,
    artifacts: [],
  };
});
// An ending that hands nothing on stops the item, so it always tells an operator.
if (!handsOn && asks.length === 0) {
  asks.push({
    question: gate ? 'This change is ready. May it land?' : 'Landing this change stopped. What should happen to it now?',
    context: [
      [`${stage} ended as ${outcome} and attached no question.`, summary, String(last.for_next ?? '')].filter(Boolean).join(' '),
      unrecommended('the stage left no question, so no judgment of the options exists.'),
    ].join('\n\n'),
    options: routes,
    recommendation: null,
    artifacts: [],
  });
}

// After a merge: the item's merge and its landing branch are facts the engine keeps
// (`archon workflow merged`, `archon workflow landing`). Both are read from the host
// here, not taken from what the agent said. A record that could not be written is said
// in the result and does not undo a landing that happened.
let recorded = '';
if (stage === 'land' && outcome === 'landed') {
  try {
    const cli: string[] = JSON.parse(process.env.ARCHON_CLI_COMMAND ?? '');
    const host = (args: string[]) => {
      const ran = Bun.spawnSync([...cli, 'workflow', ...args, '--json'], { env: process.env, stdout: 'pipe', stderr: 'pipe' });
      if (ran.exitCode !== 0) throw new Error(`archon workflow ${args[0]}: ${ran.stderr.toString().trim() || ran.stdout.toString().trim()}`);
    };
    const key = item()?.item.key;
    const where = change ? forge('resolve', { remote: change, web: true }) : null;
    if (!key) recorded = 'not recorded: the run is on no item';
    else if (!where || where.kind !== 'resolved' || where.subject?.kind !== 'pr') recorded = 'not recorded: the change is on no host, so no host reported a merge';
    else {
      const ref = { repo: where.repo, number: where.subject.number };
      const seen = forge('pr.view', { selector: { kind: 'number', ref } });
      const at = seen?.timestamps?.merged_at;
      if (seen?.pr.state !== 'merged' || !at) recorded = `not recorded: the host says the change is ${seen?.pr.state ?? 'unknown'}`;
      else {
        const commit = forge('pr.merge-state', { ref }).merge_commit;
        host(['merged', '--item', key, '--change', seen.pr.url, '--at', at, ...(commit ? ['--commit', commit] : [])]);
        // Later work on the item, such as a fix after the landed check, is cut from the
        // branch the change landed on. With no landing branch set that is the base branch
        // already, and nothing is recorded.
        if (input('land_on').trim()) host(['landing', '--item', key, '--branch', seen.pr.base]);
        recorded = `merged into ${seen.pr.base}${commit ? ` as ${commit}` : ''}`;
      }
    }
  } catch (error) {
    recorded = `not recorded: ${error instanceof Error ? error.message : String(error)}`;
  }
  console.error(`landing: ${recorded}`);
}

const said = [last.returned, last.stop, gate ? last.why : ''].map(text => String(text ?? '').trim()).filter(Boolean).join('\n\n');
emit({
  ...last,
  outcome,
  change,
  summary,
  // What the builder gets when the change goes back: from the land stage, or from an
  // operator who answered `send-back`, whose answer the builder is given beside it.
  returned: outcome === 'land' || outcome === 'landed' ? '' : [
    `The change is proposed at ${change}`,
    gate ? `The land gate did not let it land by itself:\n\n${said}` : `It did not land:\n\n${said}`,
    'Commit on the same branch and push it to where the change is proposed, so the host looks again.',
  ].join('\n\n'),
  noticed: (gate ? parse('delivered')?.noticed : parse('noticed')) ?? [],
  recorded,
  asks,
});
