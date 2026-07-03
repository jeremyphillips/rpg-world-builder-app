#!/usr/bin/env bash
# Gate on fallow complexity (and optional CRAP via coverage). fallow health exits 1
# even with 0 findings (v2.89); we gate on the human summary line instead.
set -euo pipefail

cmd=(fallow health --production --complexity --format human)
if [[ "${1:-}" == "--coverage" ]]; then
  if [[ $# -lt 2 ]]; then
    echo "usage: fallow-health-gate.sh [--coverage <coverage-final.json>]" >&2
    exit 2
  fi
  cmd+=(--coverage "$2")
fi

complexity_out=$("${cmd[@]}" 2>&1) || true
printf '%s\n' "$complexity_out"
echo "$complexity_out" | grep -Fq '✓ No functions exceed complexity thresholds' || exit 1
