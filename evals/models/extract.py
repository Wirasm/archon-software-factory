#!/usr/bin/env python3
"""Write what one past stage-check round was given and what its checks returned.

Usage: extract.py <archon.db> <stage-check run id> <out dir>
Writes item.md, answers.md, returned_before.md, builder_reply.md, meta.json (commit, base,
change, policies, outcome) and live-<check>.json for review, tests, product and verdict.
"""
import json, sqlite3, sys, os
db, run, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
meta, outcome = con.execute("select metadata, completed_outcome from remote_agent_workflow_runs where id=?", (run,)).fetchone()
inputs = json.loads(meta).get("inputs_values") or json.loads(meta).get("inputs") or {}
for name in ("item", "answers", "returned_before", "builder_reply"):
    open(f"{out}/{name}.md", "w").write(str(inputs.get(name) or ""))
def find(o, want):
    if isinstance(o, dict):
        if want(o): return o
        for v in o.values():
            r = find(v, want)
            if r is not None: return r
    if isinstance(o, list):
        for v in o:
            r = find(v, want)
            if r is not None: return r
    if isinstance(o, str) and o.lstrip()[:1] in "{[":
        try: return find(json.loads(o), want)
        except Exception: return None
    return None
info = {"run": run, "outcome": outcome, "change": inputs.get("change", ""),
        "policies": {k: inputs.get(k, "") for k in ("review_policy", "test_policy", "product_policy")}}
for step, data in con.execute("select step_name, data from remote_agent_workflow_events where workflow_run_id=? and event_type='node_completed'", (run,)):
    d = json.loads(data)
    if step == "base":
        info["base"] = str(d.get("node_output", "")).strip()
    for check in ("review", "tests", "product", "verdict"):
        if step == f"{check}__{check}":
            got = d.get("node_output")
            if isinstance(got, str):
                try: got = json.loads(got)
                except Exception: pass
            if not isinstance(got, dict): got = find(d, lambda o: "outcome" in o and "summary" in o)
            json.dump(got, open(f"{out}/live-{check}.json", "w"), indent=1)
            if check == "review":
                c = find(d, lambda o: "commit" in o and "tree" in o)
                info["commit"] = c and c["commit"]
json.dump(info, open(f"{out}/meta.json", "w"), indent=1)
print(json.dumps({k: v for k, v in info.items() if k != "policies"}))
