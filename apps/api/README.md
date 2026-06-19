# @rpg/api

The Express 5 + Mongoose API and authentication backbone. It owns the session
model (JWT in an httpOnly cookie), CSRF protection, and role-based guards. It
validates every request against the shared [`@rpg/contracts`](../../packages/contracts)
Zod schemas, so types and validation never drift from the apps. System SRD seed
JSON and loaders live in [`@rpg/catalog`](../../packages/catalog/README.md);
the content kernel imports `loadSeed*` from there — not co-located API files.

## Single-origin assumption

The app mounts **all** routes under `/api` and configures **no CORS**. In dev
and prod a reverse proxy forwards `/api/*` to this server unchanged (see the
[root README](../../README.md)), so the browser only ever talks to one origin.
This is what lets the session cookie be host-only with `SameSite=Lax`.

## Auth & cookie model

- **Session**: on login the server signs a JWT (`{ sub, role }`) and sets it in
  the `rpg_session` cookie — `httpOnly`, `SameSite=Lax`, host-only (no `Domain`),
  and `Secure` outside development. The client JS never sees the token.
- **CSRF (double-submit)**: `GET /api/auth/csrf` sets a readable `rpg_csrf`
  cookie and returns the same value as `csrfToken`. For every state-changing
  request (`POST`/`PUT`/`PATCH`/`DELETE`) the client must echo that value in the
  `x-csrf-token` header; the server compares header and cookie in constant time
  and rejects mismatches with `403`. Login refreshes the token.
- **Guards**: `requireAuth` verifies the session cookie and loads the user;
  `requireRole(...roles)` authorizes by role (runs after `requireAuth`).

## Endpoints

| Method | Path                 | Auth        | Body                               | Notes                              |
| ------ | -------------------- | ----------- | ---------------------------------- | ---------------------------------- |
| GET    | `/api/health`        | —           | —                                  | Liveness probe                     |
| GET    | `/api/auth/csrf`     | —           | —                                  | Issues CSRF cookie + token         |
| POST   | `/api/auth/register` | CSRF        | `{ email, password, displayName }` | Creates a user (default role `pc`) |
| POST   | `/api/auth/login`    | CSRF        | `{ email, password }`              | Sets session cookie, returns user  |
| POST   | `/api/auth/logout`   | CSRF + auth | —                                  | Clears session cookie              |
| GET    | `/api/auth/me`       | auth        | —                                  | Returns the current session user   |

Errors share one shape: `{ "error": { "code", "message", "details?" } }`.

## Environment

Copy [`.env.example`](.env.example) to `.env`. Variables are validated at
startup (`src/env.ts`) and the process exits with a clear message if invalid.

| Var              | Default                              | Notes                                   |
| ---------------- | ------------------------------------ | --------------------------------------- |
| `NODE_ENV`       | `development`                        | `development` \| `test` \| `production` |
| `PORT`           | `5001`                               | Matches the dev proxy's `API_URL`       |
| `MONGODB_URI`    | `mongodb://127.0.0.1:27017/rpg`      | Mongoose connection string              |
| `JWT_SECRET`     | dev fallback (required in prod, 16+) | Session signing secret                  |
| `JWT_EXPIRES_IN` | `7d`                                 | Session lifetime                        |

## Project layout (feature-first)

```text
src/
  app.ts                 # createApp(): middleware + route mounting (no listen)
  index.ts               # entry: load env, connect Mongo, listen, graceful shutdown
  env.ts                 # zod-validated configuration
  lib/                   # db, jwt, cookies, csrf, http-error
  middleware/            # validate, require-auth, require-role, csrf, error-handler
  features/
    auth/                # routes + controller + service (login/register)
    user/                # Mongoose model + service (the only DB owner of users)
  test/db.ts             # in-memory Mongo helpers for tests
```

Cross-feature imports go only through a feature's `index.ts` (enforced by the
ESLint boundary rule); e.g. `auth` reaches `user` via `../user`.

## Run & test

```sh
pnpm --filter @rpg/api dev        # tsx watch (needs a running MongoDB)
pnpm --filter @rpg/api build      # tsup -> dist/
pnpm --filter @rpg/api start      # node dist/index.js
pnpm --filter @rpg/api test       # vitest + supertest against mongodb-memory-server
pnpm --filter @rpg/api typecheck
pnpm --filter @rpg/api lint
```

Tests spin up an in-memory MongoDB (first run downloads a mongod binary) and
exercise the full register → login → me → logout flow, the role guard, and the
CSRF accept/reject paths — no external services required.
