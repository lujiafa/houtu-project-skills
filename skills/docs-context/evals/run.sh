#!/usr/bin/env bash
#
# docs-context eval runner.
#
# Reads evals/evals.json, for each eval (or a filtered subset):
#   - copies the appropriate fixture into a workspace dir under
#     docs-context-workspace/<iteration>/eval-<id>-<mode>/
#   - invokes Claude Code with the eval prompt, in two modes:
#       with_skill    -> docs-context skill installed/enabled
#       without_skill -> docs-context skill disabled (control)
#   - captures the transcript and writes grading.json with raw signals
#     (Skill invocation count, files modified, sync summary present, etc.)
#     for downstream grading by a reviewer / grader.
#
# Requires: bash 4+, python3 (for JSON parsing), claude CLI (or compatible agent runner).
#
# Usage:
#   ./run.sh                          # run all evals, both modes, into iteration-auto
#   ./run.sh --ids 19,20,22           # run only specific eval ids
#   ./run.sh --mode with_skill        # run only with_skill mode
#   ./run.sh --iteration iteration-5  # name the workspace iteration explicitly
#   ./run.sh --runs 3                 # multiple runs per eval (for trigger-rate)
#
# This script is documentation-as-code. If claude CLI is not available,
# it falls back to printing the planned commands so a human / CI can drive
# the run manually.

set -euo pipefail

# pwd_native: prefer Windows-style path (pwd -W) on Git Bash so python3 on Windows can find it.
pwd_native() { (cd "$1" && pwd -W 2>/dev/null) || (cd "$1" && pwd); }
SCRIPT_DIR="$(pwd_native "$(dirname "${BASH_SOURCE[0]}")")"
SKILL_DIR="$(pwd_native "${SCRIPT_DIR}/..")"
SKILLS_PARENT="$(pwd_native "${SKILL_DIR}/..")"
WORKSPACE_ROOT="${SKILLS_PARENT}/docs-context-workspace"
EVALS_JSON="${SCRIPT_DIR}/evals.json"
FIXTURES_DIR="${SCRIPT_DIR}/files"

# ---------- arg parsing ----------
ITERATION=""
IDS=""
MODES="with_skill,without_skill"
RUNS=1
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ids) IDS="$2"; shift 2 ;;
    --mode) MODES="$2"; shift 2 ;;
    --iteration) ITERATION="$2"; shift 2 ;;
    --runs) RUNS="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '2,40p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

# Default iteration name: iteration-auto-<timestamp>
if [[ -z "${ITERATION}" ]]; then
  ITERATION="iteration-auto-$(date +%Y%m%d-%H%M%S)"
fi
ITER_DIR="${WORKSPACE_ROOT}/${ITERATION}"

# ---------- preflight ----------
command -v python3 >/dev/null 2>&1 || { echo "ERROR: python3 not installed"; exit 3; }
[[ -f "${EVALS_JSON}" ]] || { echo "ERROR: evals.json not found at ${EVALS_JSON}"; exit 3; }

CLAUDE_BIN="$(command -v claude || true)"
if [[ -z "${CLAUDE_BIN}" ]]; then
  echo "WARN: 'claude' CLI not found in PATH; running in dry-run mode (commands printed only)."
  DRY_RUN=1
fi

if [[ "$DRY_RUN" -ne 1 ]]; then
  mkdir -p "${ITER_DIR}"
fi

# ---------- helpers ----------
fixture_for_eval() {
  local id="$1"
  python3 -c "
import json,sys
with open('${EVALS_JSON}', encoding='utf-8') as f: d=json.load(f)
e=next((e for e in d['evals'] if e['id']==${id}), None)
if e and e.get('files'):
    print(e['files'][0].replace('evals/files/','').rstrip('/'))
"
}

prompt_for_eval() {
  local id="$1"
  python3 -c "
import json
with open('${EVALS_JSON}', encoding='utf-8') as f: d=json.load(f)
e=next((e for e in d['evals'] if e['id']==${id}), None)
if e: print(e['prompt'])
"
}

setup_workspace() {
  local id="$1" mode="$2"
  local fixture
  fixture="$(fixture_for_eval "$id")"
  local src="${FIXTURES_DIR}/${fixture}"
  local dest="${ITER_DIR}/eval-${id}-${mode}"
  if [[ ! -d "$src" ]]; then
    echo "ERROR: fixture missing: ${src}" >&2
    return 1
  fi
  rm -rf "$dest"
  cp -r "$src" "$dest"
  echo "$dest"
}

run_one() {
  local id="$1" mode="$2" run_idx="$3"
  local skill_flag
  if [[ "$mode" == "with_skill" ]]; then
    skill_flag="--enable-skill docs-context"
  else
    skill_flag="--disable-skill docs-context"
  fi
  local planned_workspace="${ITER_DIR}/eval-${id}-${mode}"
  local planned_transcript="${planned_workspace}/run-${run_idx}.transcript.json"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[eval-${id}/${mode}/run-${run_idx}] (dry-run)"
    echo "  cp -r ${FIXTURES_DIR}/$(fixture_for_eval "$id") ${planned_workspace}"
    echo "  cd ${planned_workspace} && claude -p \"<prompt>\" --output-format json ${skill_flag} > ${planned_transcript}"
    return 0
  fi

  local workspace
  workspace="$(setup_workspace "$id" "$mode")" || return 1
  local prompt
  prompt="$(prompt_for_eval "$id")"

  local transcript="${workspace}/run-${run_idx}.transcript.json"
  local grading="${workspace}/grading.json"

  echo "[eval-${id}/${mode}/run-${run_idx}] starting in ${workspace}"

  pushd "$workspace" >/dev/null
  if ! claude -p "${prompt}" --output-format json ${skill_flag} > "${transcript}" 2>&1; then
    echo "  WARN: claude invocation failed; transcript may be incomplete"
  fi
  popd >/dev/null

  # Build raw grading signals (for offline grading by reviewer or grader script)
  local skill_invoked
  skill_invoked=$(python3 -c "
import json,sys
try:
    with open('${transcript}', encoding='utf-8') as f: d=json.load(f)
    invoked=False
    for m in d.get('messages', []):
        for c in m.get('content', []) if isinstance(m.get('content'), list) else []:
            if c.get('type')=='tool_use' and c.get('name')=='Skill':
                inp=c.get('input', {})
                if inp.get('skill')=='docs-context' or inp.get('skill_name')=='docs-context':
                    invoked=True
    print('true' if invoked else 'false')
except Exception:
    print('false')
" 2>/dev/null || echo false)

  local sync_summary_present
  sync_summary_present=$(grep -qiE "(Doc Sync Summary|文档同步摘要)" "${transcript}" 2>/dev/null && echo true || echo false)

  local files_modified_count
  files_modified_count=$(cd "$workspace" && git diff --name-only 2>/dev/null | wc -l || echo 0)

  python3 - <<PYEOF > "${grading}"
import json
print(json.dumps({
    "eval_id": ${id},
    "mode": "${mode}",
    "run": ${run_idx},
    "raw_signals": {
        "skill_invoked": ${skill_invoked},
        "sync_summary_present": ${sync_summary_present},
        "files_modified_count": ${files_modified_count},
        "transcript_path": "$(basename "$transcript")"
    },
    "grading_status": "raw_signals_only — assertions evaluated by reviewer or grader"
}, indent=2, ensure_ascii=False))
PYEOF
  echo "  -> grading.json: skill_invoked=${skill_invoked}, sync_summary=${sync_summary_present}, files_modified=${files_modified_count}"
}

# ---------- main loop ----------
ALL_IDS=$(python3 -c "
import json
with open('${EVALS_JSON}', encoding='utf-8') as f: d=json.load(f)
print(','.join(str(e['id']) for e in d['evals']))
")
TARGET_IDS="${IDS:-${ALL_IDS}}"
IFS=',' read -ra ID_ARRAY <<< "${TARGET_IDS}"
IFS=',' read -ra MODE_ARRAY <<< "${MODES}"

echo "iteration: ${ITERATION}"
echo "ids: ${TARGET_IDS}"
echo "modes: ${MODES}"
echo "runs per eval: ${RUNS}"
echo "dry-run: ${DRY_RUN}"
echo

for id in "${ID_ARRAY[@]}"; do
  for mode in "${MODE_ARRAY[@]}"; do
    for ((r=1; r<=RUNS; r++)); do
      run_one "$id" "$mode" "$r" || echo "  (eval-$id/$mode/run-$r failed)"
    done
  done
done

echo
echo "Done. Workspaces under: ${ITER_DIR}"
echo "Next steps:"
echo "  1. Review each workspace's run-*.transcript.json + grading.json + git diff."
echo "  2. Apply assertion-grading (manual or grader script) to produce final pass/fail."
echo "  3. Aggregate trigger rate per eval (>=0.5 for should_trigger, <=0.5 for should_not_trigger)."
