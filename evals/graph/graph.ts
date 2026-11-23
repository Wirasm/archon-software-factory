// A prototype of "one read gives a pack's stage graph" (Archon issue 5827), done outside the engine:
// reads a pack's workflow YAML and the install's run-ended trigger files, and writes the state of a
// map jelly. Nothing here is hand-drawn. Usage: bun graph.ts <pack dir> <triggers dir> <out state.json> [item key]
import { YAML } from 'bun';
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const [packDir, triggersDir, outFile, itemKey] = process.argv.slice(2);
type N = Record<string, any>;
const workflows = new Map<string, N>();
for (const dir of readdirSync(packDir, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
  for (const f of readdirSync(join(packDir, dir.name))) {
    if (!f.endsWith('.yaml')) continue;
    const w = YAML.parse(readFileSync(join(packDir, dir.name, f), 'utf8')) as N;
    if (w?.name && Array.isArray(w.nodes)) workflows.set(w.name, { ...w, file: `${dir.name}/${f}` });
  }
}
const kindOf = (n: N) => ['include', 'workflow', 'command', 'prompt', 'bash', 'script', 'loop_group', 'wait'].find(k => k in n) ?? 'node';
const pill: Record<string, string> = { include: 'workflow', workflow: 'workflow', command: 'agent', prompt: 'agent', bash: 'bash', script: 'script', loop_group: 'workflow', wait: 'person', node: 'agent' };

// The returns node of a workflow, followed through includes to the node that holds the schema.
function returnsOf(w: N): { node?: string; outcome?: string; asks?: string } {
  const r = w.returns; if (!r) return {};
  return typeof r === 'string' ? { node: r } : { node: r.node, outcome: r.outcome, asks: r.asks };
}
function outcomesOf(name: string, field?: string, seen = new Set<string>()): string[] {
  const w = workflows.get(name); if (!w || seen.has(name)) return []; seen.add(name);
  const r = returnsOf(w); const want = field ?? r.outcome; if (!r.node || !want) return [];
  const find = (nodes: N[]): N | undefined => { for (const n of nodes) { if (n.id === r.node) return n; if (n.loop_group) { const x = find(n.loop_group.nodes); if (x) return x; } } };
  const node = find(w.nodes); if (!node) return [];
  // An included stage holds the schema: the outcome is the same property on the node it returns.
  if (node.include) return outcomesOf(node.include, want, seen);
  const e = node.output_format?.properties?.[want]?.enum;
  return Array.isArray(e) ? e : [];
}

// Arrows between stages: the install's run-ended trigger files.
type Arrow = { from: string; outcome: string; to: string; file: string; inputs: string[] };
const arrows: Arrow[] = [];
// What starts when an operator answers a stage's asks: the install's asks-settled trigger files.
const answers: { from: string; option: string; to: string }[] = [];
if (existsSync(triggersDir)) for (const f of readdirSync(triggersDir)) {
  if (!f.endsWith('.json')) continue;
  const t = JSON.parse(readFileSync(join(triggersDir, f), 'utf8'));
  const settled = t?.on?.asksSettled;
  if (settled) answers.push({ from: settled.workflowName, option: settled.option ?? 'any answer', to: t.binding.launch.workflowName });
  const re = t?.on?.runEnded; if (!re) continue;
  arrows.push({ from: re.workflowName, outcome: re.outcome, to: t.binding.launch.workflowName, file: f, inputs: Object.keys(re.inputs ?? {}) });
}
const stages = [...new Set([...arrows, ...answers].flatMap(a => [a.from, a.to]))].filter(s => workflows.has(s));
// Order stages so arrows run downward.
const order: string[] = []; const visit = (s: string) => { if (order.includes(s)) return; order.push(s); arrows.filter(a => a.from === s).forEach(a => visit(a.to)); };
stages.filter(s => !arrows.some(a => a.to === s)).forEach(visit); stages.forEach(visit);

// Label bindings of the install's event sources: a label on an issue that starts a stage.
const labels: { label: string; to: string; every?: number }[] = [];
const sourcesFile = process.env.ARCHON_WEBHOOK_SOURCES;
if (sourcesFile && existsSync(sourcesFile)) for (const src of JSON.parse(readFileSync(sourcesFile, 'utf8')).sources ?? [])
  for (const b of src.config?.bindings ?? []) if (b.selector?.kind === 'label.changed')
    labels.push({ label: (b.selector.predicates ?? []).map((p: N) => p.equals ?? (p.in ?? []).join('|')).join(','), to: b.launch.workflowName, every: src.observe?.everySeconds });

const nodes: N[] = []; const edges: N[] = []; const layers: N[] = [{ id: 'who', label: 'Who starts and answers' }, { id: 'stages', label: 'Stages and the arrows between them (from the trigger files in the install)' }];
const dead: string[] = [];
for (const s of order) {
  const w = workflows.get(s)!; const outs = outcomesOf(s); const r = returnsOf(w);
  const leaving = arrows.filter(a => a.from === s);
  const none = outs.filter(o => !leaving.some(a => a.outcome === o));
  nodes.push({ id: `stage-${s}`, layer: 'stages', label: s, nt: 'workflow', kind: 'process', type: `${w.file}${r.asks ? ' · declares asks' : ''}`,
    what: `${String(w.description ?? '').trim().split('\n').join(' ')} Outcomes: ${outs.join(', ') || 'none declared'}.` + (none.length ? ` Outcomes nothing starts from: ${none.join(', ')}${r.asks ? ' (it can leave an ask with any of them)' : ''}.` : ''),
    files: [w.file], ...(none.length && !r.asks ? { risk: `Ends that start nothing and can leave no ask: ${none.join(', ')}.` } : {}) });
  if (none.length) dead.push(`${s}: ${none.join(', ')}${r.asks ? ' (may leave an ask)' : ' (silent)'}`);
}
nodes.push({ id: 'operator', layer: 'who', label: 'Operator', nt: 'person', kind: 'person', type: 'a person, or their agent',
  what: 'Orders items, answers the asks stages leave, and reads what lands. An answer names one option, and the option decides what starts next.', files: [] });
const entry = order.find(s => s === 'order') ?? order[0];
if (entry) edges.push({ from: 'operator', to: `stage-${entry}`, by: 'hand', label: 'a work order: archon trigger fire with the item key and a link or text' });
for (const l of labels) if (workflows.has(l.to))
  edges.push({ from: 'operator', to: `stage-${l.to}`, by: 'engine', label: `the label ${l.label} added to an issue${l.every ? ` (read every ${l.every} s, no webhook)` : ''}` });
// One arrow per pair of stages, naming every option that starts it.
const byPair = new Map<string, string[]>();
for (const a of answers) if (workflows.has(a.from) && workflows.has(a.to)) byPair.set(`${a.from}>${a.to}`, [...(byPair.get(`${a.from}>${a.to}`) ?? []), a.option]);
for (const [pair, options] of byPair) { const [from, to] = pair.split('>');
  edges.push({ from: `stage-${from}`, to: `stage-${to}`, by: 'engine', label: `after the operator answers ${[...new Set(options)].join(' or ')}` }); }
for (const a of arrows) if (workflows.has(a.from) && workflows.has(a.to))
  edges.push({ from: `stage-${a.from}`, to: `stage-${a.to}`, by: 'engine', label: `${a.outcome}: passes ${a.inputs.join(', ') || 'nothing'} (${a.file})` });

// Inside each stage: its nodes and edges, includes shown as one box, loop bodies expanded.
for (const s of order) {
  const w = workflows.get(s)!; layers.push({ id: `in-${s}`, label: `Inside ${s}` });
  const r = returnsOf(w);
  const walk = (list: N[], prefix: string, loop?: string) => {
    for (const n of list) {
      const k = kindOf(n); const id = `${s}--${prefix}${n.id}`;
      const what = [k === 'include' ? `Includes the stage ${n.include}.` : k === 'workflow' ? `Runs ${n.workflow} as a child run.` : k === 'command' ? `Agent, command ${n.command}.` : k === 'loop_group' ? `Loop, at most ${n.loop_group.max_iterations} rounds, until: ${n.loop_group.until_bash ?? n.loop_group.until ?? '?'}.` : `${k} node.`,
        n.when ? `Runs when: ${n.when}.` : '', n.context ? `Context: ${typeof n.context === 'string' ? n.context : JSON.stringify(n.context)}.` : '', n.id === r.node ? 'This is the node the stage returns.' : '', loop ? `In loop ${loop}.` : ''].filter(Boolean).join(' ');
      nodes.push({ id, layer: `in-${s}`, label: n.id, nt: pill[k], kind: 'process', type: k === 'include' ? `include ${n.include}` : k === 'command' ? `command ${n.command}` : k, what, files: [w.file] });
      for (const d of n.depends_on ?? []) edges.push({ from: `${s}--${prefix}${d}`, to: id, by: 'engine', label: n.when ? 'when' : '' });
      if (n.loop_group) { walk(n.loop_group.nodes, prefix, n.id); const first = n.loop_group.nodes[0]; if (first) edges.push({ from: id, to: `${s}--${prefix}${first.id}`, by: 'engine', label: 'each round' }); }
    }
  };
  walk(w.nodes, '');
}

// One item's real path, from what its runs recorded.
const traces: N[] = [];
if (itemKey) {
  const out = spawnSync('archon', ['workflow', 'runs', '--item', itemKey, '--json'], { encoding: 'utf8' }).stdout;
  try {
    const d = JSON.parse(out.slice(out.indexOf('{'))); const runs = d.runs ?? [];
    traces.push({ id: 'item', title: `The path ${itemKey} took, from its runs`, steps: runs.filter((r: N) => workflows.has(r.workflowName ?? r.workflow)).map((r: N) => ({ at: `stage-${r.workflowName ?? r.workflow}`, say: `${r.workflowName ?? r.workflow}: ${r.status}${r.outcome ? `, outcome ${r.outcome}` : ''}; started by ${r.cause?.kind === 'run_ended' ? 'the end of run ' + String(r.cause.runId).slice(0, 8) : 'hand'}.` })) });
  } catch { /* no path */ }
}
writeFileSync(outFile, JSON.stringify({ title: 'The factory, generated from its files', about: `Generated ${new Date().toISOString().slice(0, 16)} from the pack's YAML (${basename(packDir)}) and the run-ended and asks-settled trigger files in the install, plus the label bindings of its event sources. Nothing on this page is hand-drawn. Top row: stages and the arrows between them. Below: the nodes inside each stage. ${dead.length ? 'Ends nothing starts from: ' + dead.join('; ') + '.' : ''}`, layers, nodes, edges, traces, flags: [], flag_seq: 0, change: null }, null, 1));
console.log(`${order.length} stages, ${arrows.length} arrows, ${nodes.length} nodes, ${edges.length} edges`); console.log('dead ends:', dead);
