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

## Agent invocation (when to run gates)

Agents follow [AGENTS.md](../../AGENTS.md) **Agent validation** by default: narrow
Vitest paths and targeted typecheck/lint—not hooks or pre-push—unless the user
requests a **commit/checkpoint** (pre-commit) or **push/PR/full validation**
(pre-commit, then `pnpm gate:pre-push` once).

## Diagnostic collect

`pnpm test:affected:collect` is not a gate and is **not** required to finish a task.
It does not run from pre-commit, pre-push, or CI. Use explicit Vitest file paths first;
optionally run collect when the affected graph may have multiple failures. Same
`...[HEAD]` graph as `test:affected` and `test:affected:local`, with
`--continue=always`, concurrency 2, and grouped failure output. Inventory:
`.tmp/test-affected-collect.log`. Cluster failures before widening fixes. Do not add
Vitest retries. Repository gates belong at commit/push checkpoints only.

## Turbo task dependencies

In [`turbo.json`](../../turbo.json), only **`lint`** depends on upstream `^build` (ESLint
type-aware rules / generated artifacts). **`typecheck`** and **`test`** run directly against
workspace source exports — pre-commit `*:affected` does not trigger implicit package builds
for those tasks.
