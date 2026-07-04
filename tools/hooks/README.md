# Git hooks

Shell helpers invoked from [`.husky/`](../../.husky/). Package scripts in the root
`package.json` (`gate:*`, `*:affected`) are the discoverable entry points.

## Tiered gates

| When       | Scope    | Tests                | Coverage / CRAP |
| ---------- | -------- | -------------------- | --------------- |
| Pre-commit | Affected | `pnpm test:affected` | complexity only |
| Pre-push   | Full     | via `pnpm coverage`  | coverage + CRAP |
| CI         | Full     | via `pnpm coverage`  | coverage + CRAP |

Skip all hooks locally: `HUSKY=0 git commit` / `HUSKY=0 git push`.
