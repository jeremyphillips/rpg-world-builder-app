#!/usr/bin/env bash
# Regenerate committed catalog JSON schemas when @rpg/contracts Zod inputs change.
# Runs after lint-staged so Prettier does not reformat generated artifacts.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

json_schema_inputs_staged() {
  git diff --cached --name-only | grep -qE \
    '^packages/contracts/(src/|scripts/(generate-json-schemas|json-schema-post-process|catalog-schema-manifest)\.ts)'
}

if ! json_schema_inputs_staged; then
  exit 0
fi

echo 'regenerate-json-schemas: contracts Zod inputs changed — regenerating JSON schemas'
pnpm generate:json-schemas
git add packages/contracts/generated .vscode/settings.json
if ! git diff --exit-code packages/contracts/generated; then
  echo '::error::Generated JSON schemas out of sync after regeneration.' >&2
  git diff --stat packages/contracts/generated >&2
  exit 1
fi
