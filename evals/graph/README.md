# The factory's graph, generated

`graph.ts` reads the pack's workflow YAML and the run-ended trigger files of an install and writes
the state of a map jelly: stages with their outcomes and the arrows between them, the nodes inside
each stage, the ends nothing starts from, and the path one item took. It is a test of Archon issue
5827 (one read gives a pack's stage graph) done outside the engine, to find out what such a read
has to hold before the engine grows one.

    bun evals/graph/graph.ts <pack dir> ~/.archon/triggers state.json [item key]

What the first run showed (2026-11-16) is in the issue.
