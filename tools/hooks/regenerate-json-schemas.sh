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
pnpm gate:json-schemas
