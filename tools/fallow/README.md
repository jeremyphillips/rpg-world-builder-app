# Fallow dead-code baselines (SSOT / hygiene)

This repo uses [Fallow](https://docs.fallow.tools) `^2.89` for unused-code analysis.
**Knip is not used** — configuration lives in [`.fallowrc.json`](../../.fallowrc.json).

Policy hub: [docs/architecture-ssot.md](../../docs/architecture-ssot.md).

## Baseline

| File                                                   | Purpose                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| [`dead-code-baseline.json`](./dead-code-baseline.json) | Snapshot from `fallow dead-code --production --save-baseline` — **diagnostic inventory**, not a merge gate by itself |

Regenerate after intentional large export-surface changes (advisory until Phase 6):

```sh
pnpm exec fallow dead-code --production --save-baseline tools/fallow/dead-code-baseline.json
```

## Commands (verified CLI)

```sh
# Full production dead-code report
pnpm exec fallow dead-code --production --format human

# PR-scoped gate (CI: `pnpm gate:fallow-dead-code`, fetch-depth 0, base origin/main)
pnpm exec fallow dead-code \
  --production \
  --changed-since origin/main \
  --baseline tools/fallow/dead-code-baseline.json

# Broader audit (dead code + complexity + dupes on changed files; use for debugging)
pnpm exec fallow audit \
  --production-dead-code \
  --changed-since origin/main \
  --gate new-only \
  --dead-code-baseline tools/fallow/dead-code-baseline.json

# Compare regression counts (optional, separate from audit baselines)
pnpm exec fallow dead-code --production \
  --fail-on-regression \
  --regression-baseline tools/fallow/regression.json
```

## False positives

- **Feature barrels** (`features/*/index.ts`) — public API; use Fallow entry-point graph.
- **`@rpg/contracts` export surface** — governed by [`export-surface.test.ts`](../../packages/contracts/src/export-surface.test.ts).
- **Stories / tests** — excluded via `--production` and `.fallowrc.json` ignorePatterns.

## Gate status

| Phase | Behavior                                                                                                               |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| 1–2   | Baseline committed; `pnpm analyze` remains advisory (`\|\| true`)                                                      |
| 3–6   | `pnpm gate:fallow-dead-code` on CI (new-only vs baseline); set `FALLOW_DEAD_CODE_ADVISORY=1` locally for warnings-only |

Do not auto-delete exports from Fallow output without triage (problem **C**).

## Phase 7 — confirmed debt cleanup

High-confidence **H2** orphans only (leaf modules, zero importers). Do **not** purge feature
barrels or vocabulary `*_ENTRIES`.

| Artifact                                                               | Role                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`phase7-monster-form-labels.json`](./phase7-monster-form-labels.json) | Manifest of removed/unexported symbols from `monster-form-labels.ts` (2026-11) |

After a cleanup batch, refresh the baseline:

```sh
pnpm exec fallow dead-code --production --save-baseline tools/fallow/dead-code-baseline.json
```
