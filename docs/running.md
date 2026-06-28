# Running the project

## First-time setup

```bash
nvm use            # Node >= 22
corepack enable    # pinned pnpm
pnpm install
cp apps/api/.env.example apps/api/.env   # set JWT_SECRET for prod; dev works as-is
```

Start a local MongoDB (Docker or Homebrew) — see the root
[README](../README.md#getting-started) for exact commands — then bring up the
stack.

## Dev (all apps behind one origin)

```bash
pnpm dev
```

This runs the dev proxy **and** all four app dev servers concurrently (via
Turbo). Open the single proxy origin:

```
http://localhost:8080
```

| Route     | Lands on                                        |
| --------- | ----------------------------------------------- |
| `/`       | public landing (`/login`, `/signup`)            |
| `/app/`   | dashboard (redirects to `/login` if signed out) |
| `/bench/` | Dev Bench (local workbench; no auth)            |
| `/api`    | Express API                                     |

### Why go through the proxy?

The apps call the API with **relative** paths and rely on same-origin cookies.
Visiting an app's own dev port directly (e.g. `http://localhost:3000`) makes
`/api/...` resolve against that port and **404** — and the dashboard's bare
`http://localhost:5173/app` (or bench's `http://localhost:5174/bench/`) will
show Vite's base-mismatch hint if you omit the trailing slash on the proxy path.
Always use the proxy origin (`:8080`), and note the dashboard lives at `/app/`
and Dev Bench at `/bench/` (trailing slash).

## Per-workspace scripts

Run a single workspace with a pnpm filter:

```bash
pnpm --filter @rpg/api dev          # API only (tsx watch on :5001)
pnpm --filter @rpg/public dev       # Next only (:3000)
pnpm --filter @rpg/dashboard dev    # Vite only (:5173 → open /app/)
pnpm --filter @rpg/bench dev        # Vite only (:5174 → open /bench/)
pnpm --filter @rpg/dashboard analyze # production build + bundle treemap (opens bundle-stats/stats.html)
```

See [apps/dashboard/docs/code-splitting.md](../apps/dashboard/docs/code-splitting.md)
for splitting conventions and interpreting the treemap.

### Storybook

Root shorthands (from the repo root):

```bash
pnpm storybook:ui         # UI primitives (:6006)
pnpm storybook:dashboard  # Dashboard composition (:6007)
pnpm storybook            # both concurrently
```

Equivalent filter commands:

```bash
pnpm --filter @rpg/ui storybook
pnpm --filter @rpg/dashboard storybook
```

| Port | Package          | Stories                                            |
| ---- | ---------------- | -------------------------------------------------- |
| 6006 | `@rpg/ui`        | Shared primitives, forms, recipes in `packages/ui` |
| 6007 | `@rpg/dashboard` | Co-located `*.stories.tsx` under `apps/dashboard`  |

Use `:6006` for design-system work; use `:6007` for content catalog and layout
composition stories that depend on dashboard paths and providers.

CI runs axe against both Storybooks on PRs via the
[Storybook A11y](../.github/workflows/storybook-a11y.yml) workflow (`ui` and
`dashboard` matrix jobs).

## Quality gates (Turbo, all workspaces)

```bash
pnpm build       # turbo run build
pnpm lint        # turbo run lint
pnpm typecheck   # turbo run typecheck
pnpm test        # turbo run test
pnpm format      # prettier --write .
pnpm analyze     # fallow code-health report
```

## Troubleshooting

| Symptom                                          | Cause / fix                                                     |
| ------------------------------------------------ | --------------------------------------------------------------- |
| "Could not establish a session token." on a form | Loaded an app on its own port — use `http://localhost:8080`.    |
| Vite "public base URL of /app/" hint             | Visit `/app/` (trailing slash); the proxy 302s bare `/app`.     |
| Vite "public base URL of /bench/" hint           | Visit `/bench/` (trailing slash); the proxy 302s bare `/bench`. |
| Dev Bench API 404 when testing UI                | Use `http://localhost:8080/bench/`, not bare `:5174`.           |
| API exits on boot with an env error              | Fill in `apps/api/.env` (or set `JWT_SECRET` in production).    |
| API can't connect to Mongo                       | Start MongoDB; check `MONGODB_URI`. See root README.            |
