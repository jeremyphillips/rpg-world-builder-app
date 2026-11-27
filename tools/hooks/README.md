# Git hooks

Shell helpers invoked from [`.husky/`](../../.husky/). Package scripts in the root
`package.json` (`gate:*`, `*:affected`) are the discoverable entry points.

## Tiered gates

| When       | Scope                      | Tests / types                           | Coverage / CRAP     |
| ---------- | -------------------------- | --------------------------------------- | ------------------- |
| Pre-commit | Staged + cheap repo checks | none (focused tests during dev)         | complexity only     |
| Pre-push   | Since `origin/main` + full | `gate:ci:quality`, `test:affected:gate` | via `pnpm coverage` |
| CI         | Full                       | via `pnpm coverage`                     | coverage + CRAP     |

**Pre-commit** sequence (fast checkpoint):

```text
pnpm lint-staged
→ regenerate JSON schemas (conditional)
→ pnpm gate:fallow-health
→ pnpm gate:fallow-dupes
```

**CI** also runs [`fallow-dead-code-gate.sh`](fallow-dead-code-gate.sh) after affected
typecheck/lint (`pnpm gate:fallow-dead-code`) — new production dead exports only
(see [tools/fallow/README.md](../fallow/README.md)).

**Commit-msg:** `commitlint` (Conventional Commits).

**Pre-push** (`pnpm gate:pre-push`):

```text
pnpm gate:ci:quality
→ pnpm test:affected:gate
→ pnpm coverage
→ pnpm gate:fallow-health:coverage
→ pnpm build
```

Fallow runs at commit (complexity/dupes) and again at push with CRAP after coverage.

### Fallow complexity

[`fallow-health-gate.sh`](fallow-health-gate.sh) delegates to [`fallow-health-gate.mjs`](fallow-health-gate.mjs)
(Fallow **2.89** JSON `findings[].exceeded`):

| Mode       | Command                            | Fails on                                 |
| ---------- | ---------------------------------- | ---------------------------------------- |
| Pre-commit | `pnpm gate:fallow-health`          | `cyclomatic`, `cognitive`, `both`        |
| Coverage   | `pnpm gate:fallow-health:coverage` | Any finding, including `crap` (Istanbul) |

Estimated CRAP-only findings do **not** fail pre-commit. Missing `coverage-final.json`
on the coverage gate exits **2** (fails closed). Fallow exit **2** (parse/config) is
not treated as success. Policy: [docs/complexity-remediation.md](../../docs/complexity-remediation.md).

Unit tests: `pnpm exec vitest run tools/hooks/fallow-health-gate.lib.test.mjs`

[`regenerate-json-schemas.sh`](regenerate-json-schemas.sh) runs after lint-staged when staged
files touch `@rpg/contracts` Zod sources that feed catalog JSON Schema generation. It runs
`pnpm generate:json-schemas`, stages `packages/contracts/generated` and
`.vscode/settings.json`, then verifies the working tree matches the index for generated
output. CI runs `pnpm gate:json-schemas` on every PR.

Skip all hooks locally: `HUSKY=0 git commit` / `HUSKY=0 git push`.

## Cursor dispatch hook

[`.cursor/hooks.json`](../../.cursor/hooks.json) runs
[`cursor-subagent-start-log.mjs`](cursor-subagent-start-log.mjs) on `subagentStart`.
It appends one JSON line to `.tmp/agent-workflow/subagent-start.jsonl` and always
prints `{"permission":"allow"}`. It does not deny launches, and it is not part of
the Git hook tiers above.

Unit tests: `pnpm exec vitest run --config tools/hooks/vitest.config.ts tools/hooks/cursor-subagent-start-log.test.mjs`

**Dispatch id shape (hook correlation).** Logged `dispatchId` values must match
`cursor-subagent-start-log.mjs` — suffix `-<6 lowercase hex>` after the UTC
timestamp (`wf-<plan-slug>-yyyymmddThhmmssZ-abcdef`). Shorter or longer suffixes
are not recognized; the hook logs `dispatchId: null` even when the worker prompt
contains a `Dispatch:` line. Generate exactly six hex characters in prompts (same
rule as [orchestrate `reference.md`](../../.cursor/skills/orchestrate/reference.md#dispatch-id)).

Resolution order in `buildLogRecord`: optional hook payload field `dispatch_id`
(when it passes the same shape check) wins; otherwise the first valid id on a
`Dispatch:` line in `task`.

After a worker returns, the orchestrator can verify the logged model with
[`agent-workflow-model-check.mjs`](agent-workflow-model-check.mjs) (dispatch id as
`argv[2]`, allowed model ids after that, default log
`.tmp/agent-workflow/subagent-start.jsonl`). Procedure and when to checkpoint live in
[orchestrate `reference.md`](../../.cursor/skills/orchestrate/reference.md#model-check)—not
duplicated here.

```bash
node tools/hooks/agent-workflow-model-check.mjs <dispatch-id> composer-2.5
```

Unit tests: `pnpm exec vitest run --config tools/hooks/vitest.config.ts tools/hooks/agent-workflow-model-check.test.mjs`

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
