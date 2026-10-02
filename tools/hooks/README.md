# Git hooks

Shell helpers invoked from [`.husky/`](../../.husky/). Package scripts in the root
`package.json` (`gate:*`, `*:affected`) are the discoverable entry points.

## Tiered gates

| When       | Scope                      | Tests / types                        | Coverage / CRAP     |
| ---------- | -------------------------- | ------------------------------------ | ------------------- |
| Pre-commit | Staged + cheap repo checks | none (focused tests during dev)      | complexity only     |
| Pre-push   | Since `origin/main` + full | `typecheck:ci`, `test:affected:gate` | via `pnpm coverage` |
| CI         | Full                       | via `pnpm coverage`                  | coverage + CRAP     |

**Pre-commit** sequence (fast checkpoint):

```text
pnpm lint-staged
→ regenerate JSON schemas (conditional)
→ pnpm gate:fallow-health
→ pnpm gate:fallow-dupes
```

**Commit-msg:** `commitlint` (Conventional Commits).

**Pre-push** (`pnpm gate:pre-push`):

```text
pnpm typecheck:ci
→ pnpm test:affected:gate
→ pnpm coverage
→ pnpm gate:fallow-health:coverage
→ pnpm build
```

Fallow runs at commit (complexity/dupes) and again at push with CRAP after coverage.

[`regenerate-json-schemas.sh`](regenerate-json-schemas.sh) runs after lint-staged when staged
files touch `@rpg/contracts` Zod sources that feed catalog JSON Schema generation. It runs
`pnpm generate:json-schemas`, stages `packages/contracts/generated` and
`.vscode/settings.json`, then verifies the working tree matches the index for generated
output. CI runs `pnpm gate:json-schemas` on every PR.

Skip all hooks locally: `HUSKY=0 git commit` / `HUSKY=0 git push`.

## Agent invocation (when to run gates)

Agents follow [AGENTS.md](../../AGENTS.md) **Agent validation** by default: narrow
Vitest paths and targeted typecheck/lint—not hooks or pre-push—unless the user
requests a **commit/checkpoint** (pre-commit + commit-msg) or **push/PR/full validation**
(pre-commit once, then `pnpm gate:pre-push` once).

## Affected test commands

| Script                  | Role                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `test:affected:local`   | Interactive fail-fast affected tests (`TURBO_CONCURRENCY=2`)                                |
| `test:affected:gate`    | Pre-push gate (`…[origin/main]`): `--continue=always`, failure summary, nonzero on any fail |
| `test:affected:collect` | Optional diagnostic (`…[HEAD]`); writes `.tmp/test-affected-collect.log`                    |

Do **not** require `test:affected:collect` before `test:affected:gate` or before push—the
gate already collects all package failures in one run.

## Turbo task dependencies

In [`turbo.json`](../../turbo.json), only **`lint`** depends on upstream `^build` (ESLint
type-aware rules / generated artifacts). **`typecheck`** and **`test`** run directly against
workspace source exports — pre-push `*:affected` does not trigger implicit package builds
for those tasks.
