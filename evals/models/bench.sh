#!/bin/bash
# Replay the checks of past stage-check rounds on other models, on the same commit and
# with the same inputs, and keep what each returned beside what the live checks returned.
# Nothing here touches the live factory: runs use a scratch ARCHON_HOME and no item.
#
# Usage: bench.sh <out dir> <project checkout> <pack dir> <stage-check run id>...
# The out dir holds cfg-<variant>.yaml (a run config per variant) and gets one folder per round.
# Variants: review, product and tests on cfg-62; tests also on cfg-61.
set -u
OUT=$1; REPO=$2; PACK=$3; shift 3
HERE=$(cd "$(dirname "$0")" && pwd)
# One scratch home per variant and check: a home allows one run at a time on a path.
home() { local h=$OUT/home-$1; if [ ! -d "$h" ]; then mkdir -p "$h"; ln -s ~/.archon/plugins "$h/plugins"; cp ~/.archon/config.yaml "$h/config.yaml"; fi; echo "$h"; }
one() { # <round dir> <worktree> <check> <variant>
  local d=$1 wt=$2 check=$3 v=$4 policy args
  [ -s "$d/$v-$check.json" ] && return 0
  policy=$(python3 -c "import json,sys; print(json.load(open('$d/meta.json'))['policies'].get({'review':'review_policy','tests':'test_policy','product':'product_policy'}['$check'],''))")
  args=(--input-file "item=$d/item.md" --input "base=$(python3 -c "import json; print(json.load(open('$d/meta.json'))['base'])")")
  [ -n "$policy" ] && args+=(--input "$( [ $check = tests ] && echo test_policy || echo ${check}_policy)=$policy")
  if [ "$check" != product ]; then
    [ -s "$d/returned_before.md" ] && args+=(--input-file "returned_before=$d/returned_before.md")
    [ -s "$d/builder_reply.md" ] && args+=(--input-file "builder_reply=$d/builder_reply.md")
  fi
  local started=$(date +%s)
  # CODEX_BIN, when set, is the Codex binary the replays use in place of the bundled one.
  (cd "$wt" && ARCHON_HOME=$(home "$v-$check") CODEX_BIN_PATH=${CODEX_BIN:-} archon workflow run "$check" --workflow-source "$PACK" --no-worktree --config "$OUT/cfg-$v.yaml" "${args[@]}" --json) > "$d/$v-$check.log" 2>&1
  grep -m1 '^{"outcome"' "$d/$v-$check.log" > "$d/$v-$check.json"
  echo "$(basename "$d") $v $check $(( $(date +%s) - started ))s $(grep -o '"outcome":"[a-z]*"' "$d/$v-$check.json" | head -1) $(grep -o 'Cost: [^ ]*' "$d/$v-$check.log" | tail -1)"
}
for run in "$@"; do
  # One worktree path for every round: a home registers the project at one path.
  d=$OUT/$run; wt=$OUT/wt
  python3 "$HERE/extract.py" ~/.archon/archon.db "$run" "$d" > /dev/null || { echo "$run: extract failed"; continue; }
  commit=$(python3 -c "import json; print(json.load(open('$d/meta.json')).get('commit') or '')")
  [ -n "$commit" ] || { echo "$run: no commit recorded"; continue; }
  # Hold while the machine is busy: the checks run the project's tests.
  while [ "$(sysctl -n vm.loadavg | awk '{print int($2)}')" -gt 30 ]; do sleep 60; done
  if [ ! -d "$wt" ]; then
    git -C "$REPO" fetch -q origin "$commit" 2>/dev/null
    git -C "$REPO" worktree add -q --detach "$wt" "$commit" || { echo "$run: no worktree at $commit"; continue; }
    (cd "$wt" && bun install --frozen-lockfile > "$d/install.log" 2>&1) || echo "$run: bun install failed"
  fi
  one "$d" "$wt" review 62 & one "$d" "$wt" product 62 & one "$d" "$wt" tests 62 & one "$d" "$wt" tests 61 & wait
  git -C "$REPO" worktree remove --force "$wt"
done
echo "bench done: $*"
