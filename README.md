# RPG World Builder

Campaign tooling for tabletop RPGs. A DM-facing dashboard for authoring campaign content, a public marketing/auth site, and a shared API. No rules engine.

> Foundation in progress. This repo is being built in phases; see [`.cursor/plans`](.cursor/plans) / the architecture plan for the roadmap.

## Monorepo layout

```text
apps/
  public/      # Next.js (app router): landing + login/signup        -> served at /
  dashboard/   # Vite + React SPA: authenticated DM workspace         -> served at /app
  api/         # Express + Mongoose: auth, domain API                 -> served at /api
packages/
  config/      # shared tsconfig / eslint / prettier / tailwind preset
  contracts/   # Zod schemas + inferred TS types (single source of truth)
  ui/          # shadcn primitives, design tokens, Storybook
tools/
  proxy/       # single-origin dev reverse proxy
docs/          # cross-cutting architecture docs
```

> `apps/*` and `packages/*` are mostly empty in Phase 0; each is added in a later phase.

## Single-origin model

In both dev and prod, all three apps sit behind one origin, routed by path:

| Path   | App             |
| ------ | --------------- |
| `/`    | Next public app |
| `/app` | Vite dashboard  |
| `/api` | Express API     |

This avoids CORS, allows a host-only session cookie, and keeps redirects between
apps as simple relative paths. In dev this is provided by
[`tools/proxy/dev-proxy.mjs`](tools/proxy/dev-proxy.mjs); in prod the platform's
reverse proxy / CDN performs the same path routing.

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

### 3. Configure the API env

```bash
cp apps/api/.env.example apps/api/.env
# set JWT_SECRET (>= 16 chars); MONGODB_URI already points at the local mongo
```

### 4. Run the dev servers

```bash
pnpm dev        # runs the dev proxy + all app dev servers (via turbo)
```

Then open the proxy URL (default `http://localhost:8080`).

### Proxy ports (override via env)

| Var             | Default                 | Purpose           |
| --------------- | ----------------------- | ----------------- |
| `PROXY_PORT`    | `8080`                  | single dev origin |
| `PUBLIC_URL`    | `http://localhost:3000` | Next public app   |
| `DASHBOARD_URL` | `http://localhost:5173` | Vite dashboard    |
| `API_URL`       | `http://localhost:5001` | Express API       |

## Scripts

| Script           | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Dev proxy + all workspace dev servers    |
| `pnpm dev:proxy` | Just the single-origin dev reverse proxy |
| `pnpm build`     | Build all workspaces (turbo)             |
| `pnpm lint`      | Lint all workspaces (turbo)              |
| `pnpm typecheck` | Typecheck all workspaces (turbo)         |
| `pnpm test`      | Test all workspaces (turbo)              |

## Tech stack

React, Next.js (public), Vite (dashboard), Express + Mongoose (API), TypeScript,
Tailwind + shadcn/ui, Zod, TanStack Query, Vitest, Storybook, Turborepo, pnpm.
