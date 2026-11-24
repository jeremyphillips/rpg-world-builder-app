#!/usr/bin/env bash
# PR-scoped Fallow dead-code regression — new production issues vs baseline (tools/fallow/README.md).
# Uses `fallow dead-code` (not full `fallow audit`) so complexity/dupes stay in existing hooks.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

BASE="${FALLOW_DEAD_CODE_BASE:-origin/main}"

set +e
out=$(
  fallow dead-code \
    --production \
    --changed-since "$BASE" \
    --baseline tools/fallow/dead-code-baseline.json \
    --format human 2>&1
)
status=$?
set -e

printf '%s\n' "$out"

if [[ "$status" -ne 0 ]]; then
  if [[ "${FALLOW_DEAD_CODE_ADVISORY:-}" == "1" ]]; then
    echo '::warning::Fallow dead-code regression (advisory mode)' >&2
    exit 0
  fi
  exit "$status"
fi