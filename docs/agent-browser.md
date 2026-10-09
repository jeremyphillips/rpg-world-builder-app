# Browser verification for agents

How Cursor (or other) agents should sign in and check dashboard work locally.
This is **dev-only** tooling — not loaded by any app at runtime.

## Dev origin

Run `pnpm dev` and use the **proxy** URL (default `http://localhost:8080`), not
the Vite or Next dev ports directly. Cookies and CSRF must stay same-origin.

| Route     | App                                               |
| --------- | ------------------------------------------------- |
| `/login`  | Public app — login/signup forms                   |
| `/app/`   | Dashboard — requires session; else redirect login |
| `/bench/` | Dev Bench — no auth                               |
| `/api/*`  | Express API                                       |

Proxy env vars: [environment.md](./environment.md#dev-proxy-variables).

## Credentials file (repo root)

Keep **`.env.local` at the repository root**, not under `apps/dashboard/`.

- Login happens on the **public** app; the session is shared across `/app/` on
  the same origin.
- The API does not auto-load dotenv files ([environment.md](./environment.md)).
- Vite in the dashboard only exposes `VITE_*` to client bundles — do **not**
  put agent passwords in dashboard env or `VITE_` variables ([AGENTS.md](../AGENTS.md)
  **Secrets / RSC boundary**).

Copy this shape into gitignored `.env.local` (never commit):

```bash
DEV_AGENT_EMAIL=your-agent@example.com
DEV_AGENT_PASSWORD=your-long-password
```

Use plain values — no trailing `\n` unless that character is literally part of
the password.

Create the user once via `http://localhost:8080/signup` (or register through
the API in dev). Reuse the same account across agent runs. API integration tests
use ephemeral users via `apps/api/src/test/auth-agent.ts`; that is separate
from your long-lived local Mongo user.

## Login flow (browser)

1. Open `http://localhost:8080/login`.
2. Submit `DEV_AGENT_EMAIL` and `DEV_AGENT_PASSWORD` from `.env.local`.
3. Expect redirect to `/app/` when the session is valid.

Session model: [AGENTS.md](../AGENTS.md) **Auth model**; dashboard guard detail →
[apps/dashboard/docs/auth-guard.md](../apps/dashboard/docs/auth-guard.md).

## Quick API check (optional)

From the repo root, agents can verify credentials without the browser:

```bash
# Read DEV_AGENT_* from .env.local, then POST /api/auth/login on the proxy
```

A `401` usually means the user is missing in this Mongo DB or the password in
`.env.local` does not match the stored bcrypt hash.

## Admin / superadmin surfaces

New signups default to platform role `user`. Testing `/app/…` admin routes
requires promoting the account in local Mongo (same as manual admin dev work).
See [apps/api/docs/admin-users.md](../apps/api/docs/admin-users.md).

## When auth is not needed

Use `/bench/` for Dev Bench UI work. Storybook (`@rpg/ui` / dashboard stories)
does not use this login path.
