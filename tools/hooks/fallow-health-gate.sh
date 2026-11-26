#!/usr/bin/env bash
# Gate on fallow complexity via JSON policy (see fallow-health-gate.mjs).
# Pre-commit: cyclomatic and cognitive only. Coverage gate: includes CRAP (Istanbul).
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ "${1:-}" == "--coverage" ]]; then
  if [[ $# -lt 2 ]]; then
    echo "usage: fallow-health-gate.sh [--coverage <coverage-final.json>]" >&2
    exit 2
  fi
  exec node "$HOOK_DIR/fallow-health-gate.mjs" --coverage "$2"
fi

exec node "$HOOK_DIR/fallow-health-gate.mjs"