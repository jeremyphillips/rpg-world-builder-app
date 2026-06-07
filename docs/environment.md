# Environment & configuration

## Prerequisites

- **Node** `>= 22` — see [`.nvmrc`](../.nvmrc); run `nvm use`.
- **pnpm** — the repo pins `pnpm@11.5.2` via `packageManager`; enable with
  `corepack enable`.
- **MongoDB** `>= 7` running locally, or Docker to run one. Setup commands are
  in the root [README](../README.md#getting-started).

## API environment variables

The API validates its environment at startup (`apps/api/src/env.ts`); a
misconfiguration fails fast with a clear message. Copy the example and adjust:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable         | Required      | Default                         | Purpose                                          |
| ---------------- | ------------- | ------------------------------- | ------------------------------------------------ |
| `NODE_ENV`       | no            | `development`                   | `development` \| `test` \| `production`          |
| `PORT`           | no            | `5001`                          | API listen port (the proxy forwards `/api` here) |
| `MONGODB_URI`    | no            | `mongodb://127.0.0.1:27017/rpg` | MongoDB connection string                        |
| `JWT_SECRET`     | **prod only** | dev fallback outside production | Session JWT signing secret (min 16 chars)        |
| `JWT_EXPIRES_IN` | no            | `7d`                            | Session lifetime (ms/vercel-style duration)      |

> Outside production a dev fallback `JWT_SECRET` is used if unset, so the API
> boots with zero config against a local Mongo. In production `JWT_SECRET` is
> required and must be at least 16 characters.

## Dev proxy variables

The single-origin dev proxy ([`tools/proxy/dev-proxy.mjs`](../tools/proxy/dev-proxy.mjs))
is configurable via env (all optional):

| Variable        | Default                 | Purpose           |
| --------------- | ----------------------- | ----------------- |
| `PROXY_PORT`    | `8080`                  | single dev origin |
| `PUBLIC_URL`    | `http://localhost:3000` | Next public app   |
| `DASHBOARD_URL` | `http://localhost:5173` | Vite dashboard    |
| `API_URL`       | `http://localhost:5001` | Express API       |

## Frontend configuration

The apps make **relative, same-origin** API calls (`fetch("/api/...")`) — there
is no API base URL env var, by design (see [architecture.md](./architecture.md)).
The dashboard's served base path is fixed at `/app/` in `vite.config.ts`.
