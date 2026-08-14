# RPG World Builder

Campaign tooling for tabletop RPGs. A DM-facing dashboard for authoring campaign content, a public marketing/auth site, a local Dev Bench workbench, and a shared API. No rules engine.

> Auth, campaign management, catalog content authoring (classes, species, feats,
> spells, equipment, skill proficiencies), and homebrew/vocabulary tooling are in
> progress. Character builder, locations, monsters, messaging, and notifications
> are not yet built. There is no rules engine.

## Monorepo layout

```text
apps/
  public/      # Next.js (App Router): landing + login/signup        -> served at /
  dashboard/   # Vite + React SPA: authenticated DM workspace         -> served at /app
  bench/       # Vite + React SPA: Dev Bench workbench                -> served at /bench
  api/         # Express + Mongoose: auth, domain API                 -> served at /api
packages/
  config/      # shared tsconfig / eslint / prettier / vitest / storybook presets
  contracts/   # Zod schemas + inferred TS types (single source of truth)
  dev-bench-core/  # Dev Bench domain helpers (workflow, seeds, agent formatting)
  api-client/  # same-origin fetch + CSRF + auth helpers
  catalog/     # system SRD seed JSON + validated loaders
  ui/          # shadcn primitives, Tailwind v4 preset, design tokens, Storybook
tools/
  proxy/       # single-origin dev reverse proxy
  bench/       # @rpg/bench-cli — agent CLI (pnpm bench)
docs/          # cross-cutting architecture / environment / running guides
```

| Workspace     | Package           | README                                               |
| ------------- | ----------------- | ---------------------------------------------------- |
| Public app    | `@rpg/public`     | [apps/public](apps/public/README.md)                 |
| Dashboard     | `@rpg/dashboard`  | [apps/dashboard](apps/dashboard/README.md)           |
| Dev Bench     | `@rpg/bench`      | [apps/bench](apps/bench/README.md)                   |
| API           | `@rpg/api`        | [apps/api](apps/api/README.md)                       |
| Dev Bench CLI | `@rpg/bench-cli`  | [tools/bench](tools/bench/README.md)                 |
| Shared config | `@rpg/config`     | [packages/config](packages/config/README.md)         |
| Contracts     | `@rpg/contracts`  | [packages/contracts](packages/contracts/README.md)   |
| API client    | `@rpg/api-client` | [packages/api-client](packages/api-client/README.md) |
| Catalog       | `@rpg/catalog`    | [packages/catalog](packages/catalog/README.md)       |
| UI library    | `@rpg/ui`         | [packages/ui](packages/ui/README.md)                 |

Full workspace diagram and auth flow: [docs/architecture.md](docs/architecture.md).

## Single-origin model

In both dev and prod, all four apps sit behind one origin, routed by path:

| Path      | App             |
| --------- | --------------- |
| `/`       | Next public app |
| `/app/`   | Vite dashboard  |
| `/bench/` | Dev Bench       |
| `/api`    | Express API     |

This avoids CORS, allows a host-only session cookie, and keeps redirects between
apps as simple relative paths. In dev this is provided by
[`tools/proxy/dev-proxy.mjs`](tools/proxy/dev-proxy.mjs); in prod the platform's
reverse proxy / CDN performs the same path routing. The dashboard and Dev Bench
are built with Vite `base: "/app/"` and `base: "/bench/"` respectively, so they
are served at `/app/` and `/bench/` (trailing slash). The proxy 302s bare
`/app` and `/bench` to the trailing-slash URLs.

Login/signup live only on the public app; the API sets a host-only `httpOnly`
session cookie plus a readable CSRF token (double-submit), and the dashboard
gates itself with `GET /api/auth/me`. Dev Bench has no auth (local solo-dev
tool). Full diagrams are in [docs/architecture.md](docs/architecture.md).

## Prerequisites

- Node `>= 22` (see [`.nvmrc`](.nvmrc); `nvm use`)
- pnpm `>= 10` (repo pins `pnpm@11.5.2` via `packageManager`; enable with `corepack enable`)
- MongoDB `>= 7` running locally (see [Getting started](#getting-started)), or Docker to run one

## Getting started

### 1. Install dependencies

```bash
nvm use            # Node >= 22 (see .nvmrc)
corepack enable    # provides the pinned pnpm
pnpm install
```

### 2. Start a local MongoDB

The API connects to `MONGODB_URI` (default `mongodb://127.0.0.1:27017/rpg`).
Use whichever option you prefer:

**Docker (recommended — disposable, no host install):**

```bash
# start a local mongo on the default port, persisting data in a named volume
docker run -d --name rpg-mongo -p 27017:27017 -v rpg-mongo-data:/data/db mongo:7

# stop / start / remove later
docker stop rpg-mongo
docker start rpg-mongo
docker rm -f rpg-mongo            # delete the container (volume survives)
docker volume rm rpg-mongo-data   # delete the data too
```

**macOS (Homebrew, native service):**

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0   # run on boot/login
# or run it in the foreground:
mongod --dbpath ~/data/rpg-mongo
brew services stop mongodb-community@7.0
```

Verify the connection (optional, needs `mongosh`):

```bash
mongosh "mongodb://127.0.0.1:27017/rpg" --eval "db.runCommand({ ping: 1 })"
```

**Replica set (required for composite Building create with Organizations):**

Standalone Mongo does not support multi-document transactions. **Composite Building create**
(plans with Organization drafts or relationships) returns `transactions_unavailable`
without a replica set. Building-only create works on standalone Mongo. Other flows fall back to compensation when
`MONGO_TRANSACTION_MODE=auto`.

Only one Mongo should bind port `27017` — stop an existing `rpg-mongo` (or
Homebrew service) before starting the replica-set stack. The compose file uses a
**separate volume** (`rpg-mongo-rs-data`); switching from standalone starts with
an empty database.

```bash
docker stop rpg-mongo 2>/dev/null || true
docker compose -f docker-compose.mongo-rs.yml up -d
# wait for mongo-rs-init to exit successfully, then export before starting the API:
export MONGODB_URI='mongodb://127.0.0.1:27017/rpg?replicaSet=rs0'
```

Restart the API after Mongo is ready — transaction support is probed **once at
startup**, not per request.

Stop / remove:

```bash
docker compose -f docker-compose.mongo-rs.yml down
docker volume rm rpg-world-builder-app_rpg-mongo-rs-data   # delete data
```

### 3. Configure the API env

```bash
cp apps/api/.env.example apps/api/.env
# set JWT_SECRET (>= 16 chars) and, for replica-set Mongo, MONGODB_URI with ?replicaSet=rs0
```

The API reads **`process.env` only** — it does not load `apps/api/.env`
automatically. Export variables in the same shell before `pnpm dev`, or source
the file yourself. For replica-set Mongo:

```bash
export MONGODB_URI='mongodb://127.0.0.1:27017/rpg?replicaSet=rs0'
```

### 4. Run the dev servers

```bash
pnpm dev        # runs the dev proxy + all app dev servers (via turbo)
```

Then open the proxy URL (default `http://localhost:8080`).

| Route     | Lands on                                        |
| --------- | ----------------------------------------------- |
| `/`       | public landing (`/login`, `/signup`)            |
| `/app/`   | dashboard (redirects to `/login` if signed out) |
| `/bench/` | Dev Bench (local workbench; no auth)            |
| `/api`    | Express API                                     |

### Proxy ports (override via env)

| Var             | Default                 | Purpose           |
| --------------- | ----------------------- | ----------------- |
| `PROXY_PORT`    | `8080`                  | single dev origin |
| `PUBLIC_URL`    | `http://localhost:3000` | Next public app   |
| `DASHBOARD_URL` | `http://localhost:5173` | Vite dashboard    |
| `BENCH_URL`     | `http://localhost:5174` | Vite Dev Bench    |
| `API_URL`       | `http://localhost:5001` | Express API       |

## Scripts

| Script              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | Dev proxy + all workspace dev servers                      |
| `pnpm dev:proxy`    | Just the single-origin dev reverse proxy                   |
| `pnpm build`        | Build production workspaces (turbo; excludes `@rpg/bench`) |
| `pnpm build:bench`  | Build `@rpg/bench` only                                    |
| `pnpm lint`         | Lint all workspaces (turbo)                                |
| `pnpm typecheck`    | Typecheck all workspaces (turbo)                           |
| `pnpm test`         | Test all workspaces (turbo)                                |
| `pnpm format`       | Format the repo with Prettier                              |
| `pnpm format:check` | Check formatting without writing                           |
| `pnpm analyze`      | `fallow` code-health report                                |
| `pnpm storybook`    | UI + dashboard Storybooks concurrently (`:6006`, `:6007`)  |
| `pnpm bench`        | Dev Bench agent CLI (calls API on `:5001` directly)        |

Target one workspace with a filter, e.g. `pnpm --filter @rpg/api dev`. See
[docs/running.md](docs/running.md) for Storybook ports, Dev Bench CLI usage, and
troubleshooting.

## Documentation

- [docs/architecture.md](docs/architecture.md) — system architecture, single-origin model, auth flow
- [docs/environment.md](docs/environment.md) — prerequisites and environment variables
- [docs/running.md](docs/running.md) — running, per-workspace scripts, troubleshooting
- [docs/routing.md](docs/routing.md) — cross-app `ROUTES` conventions
- [apps/bench/README.md](apps/bench/README.md) — Dev Bench UI (`/bench/`)
- [tools/bench/README.md](tools/bench/README.md) — Dev Bench agent CLI (`pnpm bench`)
- [docs/dev-bench-agent-reference.md](docs/dev-bench-agent-reference.md) — ticket/epic field authoring for agents
- Each app/package has its own README (see the [layout table](#monorepo-layout)); the dashboard documents its [feature conventions](apps/dashboard/docs/feature-conventions.md).

## Tech stack

React, Next.js (public), Vite (dashboard, Dev Bench), Express + Mongoose (API),
TypeScript, Tailwind + shadcn/ui, Zod, TanStack Query, Vitest, Storybook,
Turborepo, pnpm.

## Licenses & attribution

The system content catalog includes material from the System Reference Document
5.2.1 by Wizards of the Coast LLC, used under
[CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode) and modified
for this project. See [`NOTICE`](NOTICE) for the full attribution and a summary
of changes.
