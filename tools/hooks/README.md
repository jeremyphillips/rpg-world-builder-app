# Git hooks

Shell helpers invoked from [`.husky/`](../../.husky/). Package scripts in the root
`package.json` (`gate:*`, `*:affected`) are the discoverable entry points.

## Tiered gates

| When       | Scope    | Tests                      | Coverage / CRAP |
| ---------- | -------- | -------------------------- | --------------- |
| Pre-commit | Affected | `pnpm test:affected:local` | complexity only |
| Pre-push   | Full     | via `pnpm coverage`        | coverage + CRAP |
| CI         | Full     | via `pnpm coverage`        | coverage + CRAP |

**Pre-commit** sequence:

```text
pnpm lint-staged
→ regenerate JSON schemas (conditional)
→ pnpm gate:fallow-health
→ pnpm gate:fallow-dupes
→ pnpm typecheck:affected
→ pnpm test:affected:local
```

Fallow runs before typecheck and tests so complexity/duplication failures fail fast
without re-running the affected test suite on fix-and-retry loops.

[`regenerate-json-schemas.sh`](regenerate-json-schemas.sh) runs after lint-staged when staged
files touch `@rpg/contracts` Zod sources that feed catalog JSON Schema generation. It runs
`pnpm generate:json-schemas`, stages `packages/contracts/generated` and
`.vscode/settings.json`, then verifies the working tree matches the index for generated
output. CI runs `pnpm gate:json-schemas` on every PR.

Skip all hooks locally: `HUSKY=0 git commit` / `HUSKY=0 git push`.

## Diagnostic collect

`pnpm test:affected:collect` is not a gate. It does not run from pre-commit,
pre-push, or CI. Agents use explicit Vitest file paths while iterating. Once
those pass, `test:affected:collect` runs the same `...[HEAD]` graph as
`test:affected` and `test:affected:local` with `--continue=always`, concurrency
2, and grouped failure output. The inventory is `.tmp/test-affected-collect.log`.
Cluster and resolve those failures before the repository gates. Do not add
Vitest retries.

## Turbo task dependencies

In [`turbo.json`](../../turbo.json), only **`lint`** depends on upstream `^build` (ESLint
type-aware rules / generated artifacts). **`typecheck`** and **`test`** run directly against
workspace source exports — pre-commit `*:affected` does not trigger implicit package builds
for those tasks.
