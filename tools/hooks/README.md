# Git hooks

Shell helpers invoked from [`.husky/`](../../.husky/). Package scripts in the root
`package.json` (`gate:*`, `*:affected`) are the discoverable entry points.

## Tiered gates

| When       | Scope    | Tests                | Coverage / CRAP |
| ---------- | -------- | -------------------- | --------------- |
| Pre-commit | Affected | `pnpm test:affected` | complexity only |
| Pre-push   | Full     | via `pnpm coverage`  | coverage + CRAP |
| CI         | Full     | via `pnpm coverage`  | coverage + CRAP |

**Pre-commit** also runs [`regenerate-json-schemas.sh`](regenerate-json-schemas.sh) after
lint-staged when staged files touch `@rpg/contracts` Zod sources that feed catalog JSON
Schema generation. It runs `pnpm generate:json-schemas`, stages
`packages/contracts/generated` and `.vscode/settings.json`, then `pnpm gate:json-schemas`.
CI runs the same freshness gate on every PR.

Skip all hooks locally: `HUSKY=0 git commit` / `HUSKY=0 git push`.
