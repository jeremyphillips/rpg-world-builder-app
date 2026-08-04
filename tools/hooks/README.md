# Git hooks

Shell helpers invoked from [`.husky/`](../../.husky/). Package scripts in the root
`package.json` (`gate:*`, `*:affected`) are the discoverable entry points.

## Tiered gates

| When       | Scope    | Tests                | Coverage / CRAP |
| ---------- | -------- | -------------------- | --------------- |
| Pre-commit | Affected | `pnpm test:affected` | complexity only |
| Pre-push   | Full     | via `pnpm coverage`  | coverage + CRAP |
| CI         | Full     | via `pnpm coverage`  | coverage + CRAP |

**Pre-commit** sequence:

```text
pnpm lint-staged
→ regenerate JSON schemas (conditional)
→ pnpm gate:fallow-health
→ pnpm gate:fallow-dupes
→ pnpm typecheck:affected
→ pnpm test:affected
```

Fallow runs before typecheck and tests so complexity/duplication failures fail fast
without re-running the affected test suite on fix-and-retry loops.

[`regenerate-json-schemas.sh`](regenerate-json-schemas.sh) runs after lint-staged when staged
files touch `@rpg/contracts` Zod sources that feed catalog JSON Schema generation. It runs
`pnpm generate:json-schemas`, stages `packages/contracts/generated` and
`.vscode/settings.json`, then verifies the working tree matches the index for generated
output. CI runs `pnpm gate:json-schemas` on every PR.

Skip all hooks locally: `HUSKY=0 git commit` / `HUSKY=0 git push`.

## Turbo task dependencies

In [`turbo.json`](../../turbo.json), only **`lint`** depends on upstream `^build` (ESLint
type-aware rules / generated artifacts). **`typecheck`** and **`test`** run directly against
workspace source exports — pre-commit `*:affected` does not trigger implicit package builds
for those tasks.
