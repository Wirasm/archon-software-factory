// The issue an item was ordered from shows that the item is in work. At `start` the order
// stage assigns whoever ordered it and adds the in-work label, when the project names one.
// At `end`, a stage that ends the item removes the label; the assignee stays. This is what
// the issue shows and nothing more: no stage gates on it, and a step that fails is said in
// a notice and fails no run.
//
// Inputs: `mode`, `start` or `end`; `ordered`, the order stage's result, whose `issue` is
// the issue the item was ordered from (null when it was ordered from none); `ordered_by`,
// start only, the forge login of whoever ordered it, empty for the account the factory acts
// as; `label`, the `in_work_label` setting, empty for none.
import { emit, forge, ForgeError, input, notice } from 'archon:script';

const mode = input('mode').trim();
const label = input('label').trim();
let issue: { repo: { host: string; path: string }; number: number } | null = null;
try {
  issue = JSON.parse(input('ordered') || 'null')?.issue ?? null;
} catch {
  issue = null;
}

const said: string[] = [];
const step = (name: string, run: () => void) => {
  try {
    run();
  } catch (error) {
    said.push(
      error instanceof ForgeError && error.kind === 'unsupported_op'
        ? `${name} skipped: the forge plugin does not support ${error.op}; update the plugin.`
        : `${name} failed: ${(error instanceof Error ? error.message : String(error)).replace(/\s+/g, ' ').slice(0, 300)}`
    );
  }
};

let assignee = '';
if (!issue) {
  emit({ outcome: 'none', assignee, label: '', said: 'The item was ordered from no issue, so nothing is shown on one.' });
} else {
  const ref = issue;
  const subject = { kind: 'issue' as const, ref };
  if (mode === 'start') {
    step('Assigning the issue', () => {
      const login = input('ordered_by').trim() || forge('actor.self', { repo: ref.repo }).actor.login;
      forge('workitem.assignee.add', { ref, login });
      assignee = login;
    });
    if (label) step(`Adding the label ${label}`, () => forge('workitem.label.add', { subject, name: label }));
  } else if (label) {
    step(`Removing the label ${label}`, () => forge('workitem.label.remove', { subject, name: label }));
  }
  for (const line of said) {
    try {
      notice(line, { stage: mode, issue: `${ref.repo.path}#${ref.number}` });
    } catch {
      // A notice that cannot be written must not fail the stage either.
    }
  }
  emit({ outcome: said.length ? 'skipped' : 'done', assignee, label, said: said.join(' ') });
}
