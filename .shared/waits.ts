// Which of the items named have not landed, read from the engine's record of the project's
// items. An item has landed when it carries a merge or one of its land runs ended `landed`.
// A key that names no item has not landed. The order stage and triage both hold an item on
// the answer, so what counts as landed is said once, here.
import { items } from 'archon:script';

export function unlanded(keys: readonly string[]): string[] {
  const wanted = new Set(keys);
  if (wanted.size === 0) return [];
  const landed = new Set<string>();
  let page = items({ since: '52w', limit: 100 });
  for (;;) {
    for (const read of page.items) {
      if (!wanted.has(read.item.key)) continue;
      const land = (name: string) => name.slice(name.lastIndexOf(':') + 1) === 'land';
      if (read.merged || read.runs.some(run => land(run.workflow) && run.outcome === 'landed')) landed.add(read.item.key);
    }
    if (!page.next) break;
    page = items({ after: page.next });
  }
  return [...wanted].filter(key => !landed.has(key));
}
