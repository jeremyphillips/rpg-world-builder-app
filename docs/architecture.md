# Architecture

Cross-cutting overview of how the RPG World Builder monorepo fits together. For
app- and package-specific detail, follow the links into each workspace's own
README and `docs/`.

## Workspaces

```text
apps/
  public/      # Next.js (App Router): landing + login/signup   -> served at /
  dashboard/   # Vite + React SPA: authenticated DM workspace    -> served at /app
  api/         # Express 5 + Mongoose: auth + domain API          -> served at /api
packages/
  config/      # shared tsconfig / eslint / prettier / vitest presets
  contracts/   # Zod schemas + inferred TS types (single source of truth)
  ui/          # shadcn primitives, Tailwind v4 preset, design tokens, Storybook
tools/
  proxy/       # single-origin dev reverse proxy
docs/          # this folder — cross-cutting architecture/env/run guides
```

| Workspace        | README                                                          |
| ---------------- | --------------------------------------------------------------- |
| `@rpg/public`    | [apps/public/README.md](../apps/public/README.md)               |
| `@rpg/dashboard` | [apps/dashboard/README.md](../apps/dashboard/README.md)         |
| `@rpg/api`       | [apps/api/README.md](../apps/api/README.md)                     |
| `@rpg/config`    | [packages/config/README.md](../packages/config/README.md)       |
| `@rpg/contracts` | [packages/contracts/README.md](../packages/contracts/README.md) |
| `@rpg/ui`        | [packages/ui/README.md](../packages/ui/README.md)               |

## Single-origin topology

All three apps sit behind **one origin**, routed by path. The browser only ever
talks to that single origin, which removes CORS, allows a host-only session
cookie, and keeps cross-app redirects as relative paths.

```mermaid
flowchart LR
  proxy["Reverse proxy (single origin)"]
  publicApp["Next.js public app\nlanding + login/signup\n(/)"]
  dashboard["Vite dashboard SPA\nDM workspace\n(/app)"]
  api["Express 5 API\n(/api)"]
  mongo[("MongoDB / Mongoose")]
  ui["packages/ui"]
  contracts["packages/contracts"]

  proxy -->|"/"| publicApp
  proxy -->|"/app"| dashboard
  proxy -->|"/api"| api
  api --> mongo
  publicApp --- ui
  dashboard --- ui
  publicApp --- contracts
  dashboard --- contracts
  api --- contracts
```

| Path   | App             | Dev upstream            |
| ------ | --------------- | ----------------------- |
| `/`    | Next public app | `http://localhost:3000` |
| `/app` | Vite dashboard  | `http://localhost:5173` |
| `/api` | Express API     | `http://localhost:5001` |

In dev this routing is provided by
[`tools/proxy/dev-proxy.mjs`](../tools/proxy/dev-proxy.mjs) (listens on `:8080`);
in prod the platform's reverse proxy / CDN performs the same path routing. The
dashboard is built with Vite `base: "/app/"`, so it is served (and its router
runs) under `/app`.

## Auth flow

Login/signup live **only** on the public app. The API issues a host-only
`httpOnly` session cookie plus a readable CSRF token (double-submit). The
dashboard gates itself by calling `GET /api/auth/me` and redirects
unauthenticated visitors back to the public `/login`.

```mermaid
sequenceDiagram
  participant U as User
  participant P as Public (/)
  participant A as API (/api)
  participant D as Dashboard (/app)
  U->>P: submit login form
  P->>A: POST /api/auth/login (same-origin, + CSRF header)
  A->>A: verify bcrypt, sign JWT
  A-->>P: Set-Cookie httpOnly session (host-only) + CSRF token
  P-->>U: redirect to /app/
  U->>D: open /app/
  D->>A: GET /api/auth/me (cookie auto-sent)
  A-->>D: { user } or 401
  D-->>U: render workspace, or redirect to /login
```

Details: [public auth forms](../apps/public/docs/auth-forms.md),
[dashboard auth guard](../apps/dashboard/docs/auth-guard.md),
and the API's cookie/CSRF model in [apps/api/README.md](../apps/api/README.md).

## Shared contracts & UI

- **`@rpg/contracts`** is the single source of truth for domain/DTO shapes:
  Zod schemas with `z.infer` types (`Role`, `User`, `SessionUser`, `LoginInput`,
  `RegisterInput`). The API validates against them; the public app's forms reuse
  the same schemas with `@hookform/resolvers/zod`.
- **`@rpg/ui`** ships shadcn primitives, the Tailwind v4 preset, and design
  tokens (`@rpg/ui/styles.css`) consumed by both apps.

## Feature-first organization

Each app organizes code under `src/features/<feature>/` with a public `index.ts`
barrel. An ESLint boundary rule (`@rpg/config/eslint/base`) forbids importing
another feature's internals — cross-feature imports must go through its
`index.ts`. The dashboard's domain feature slots are documented in
[apps/dashboard/docs/feature-conventions.md](../apps/dashboard/docs/feature-conventions.md).

## Build & tooling

Turborepo orchestrates `build`, `lint`, `typecheck`, and `test` across
workspaces (`turbo.json`); pnpm workspaces manage dependencies. Shared TS, ESLint,
Prettier, and Vitest presets live in `@rpg/config`. See
[running.md](./running.md) and [environment.md](./environment.md).
