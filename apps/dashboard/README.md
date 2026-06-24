# @rpg/dashboard

The authenticated DM workspace — a Vite + React single-page app served under
`/app`. It is the destination of the public app's login handshake: an
unauthenticated visit bounces back to the public `/login`.

## Base path

The app is built and served with `base: "/app/"` (`vite.config.ts`) so it sits
behind the single-origin dev proxy next to the public app (`/`) and the API
(`/api`). React Router uses the matching `basename` (derived from
`import.meta.env.BASE_URL`), so in-app routes resolve under `/app`.

## Single-origin / proxy assumption

The dashboard talks to the API with **relative, same-origin** requests
(`fetch("/api/auth/...")`) and `credentials: "include"`. There is no API base
URL and no CORS. That only resolves behind the dev reverse proxy (or the prod
equivalent), which routes `/api` to the Express server — see the
[root README](../../README.md). Running `vite` alone will 404 on `/api`; use
`pnpm dev` from the repo root to bring up the proxy + all apps.

## Auth-guard behavior

`AuthGuard` (`src/features/auth`) wraps the routed app:

1. On mount it queries `GET /api/auth/me` (via TanStack Query, no retry).
2. While the request is in flight it renders a loading state.
3. On success it renders the app shell + routes.
4. On a `401` (or any session error) it redirects the browser to the public
   app's `/login` (`window.location.assign("/login")`, same origin).

Logging out (`useLogout`) calls `POST /api/auth/logout` with the CSRF header,
then redirects to `/login`.

## Layout

```text
src/
  main.tsx                # mounts <App />, imports index.css
  index.css               # @rpg/ui preset + @source for class scanning
  app/
    app.tsx               # providers + router
    providers.tsx         # TanStack Query provider
    query-client.ts       # QueryClient factory
    router.tsx            # BrowserRouter (basename "/app") + routes
  components/
    layout/               # AppShell, Sidebar, Topbar (workspace chrome)
  features/
    auth/                 # feature-first: guard + session/logout hooks + api client
      index.ts            # public barrel (imports cross-feature go through here)
      api/auth-client.ts  # /auth/me, /auth/csrf, /auth/logout fetch wrappers
      components/auth-guard.tsx
      hooks/use-session.ts
      hooks/use-logout.ts
  routes/
    dashboard-home.tsx    # placeholder workspace landing
```

Tailwind v4 is wired through the `@tailwindcss/vite` plugin; UI primitives and
design tokens come from [`@rpg/ui`](../../packages/ui) and session types from
[`@rpg/contracts`](../../packages/contracts).

### Feature slots

Beyond the implemented `auth` feature, `src/features/` holds documented
scaffolds (`README.md` + placeholder `index.ts`) for the workspace's domain
areas: `user`, `campaign`, `character`, `notification`, `message`, and `content`
(with `species`, `classes`, `spells`, `skillProficiencies`,
`equipment` (family modules: weapons, armor, adventuring-gear, magic-items, tools,
mounts, vehicles, services), `locations`, `monsters`). Each is
built out in a later phase. See
[`docs/feature-conventions.md`](./docs/feature-conventions.md) for the folder
layout and the ESLint feature-boundary rule.

## Commands

```sh
pnpm --filter @rpg/dashboard dev        # vite dev on :5173 (use root `pnpm dev` for the proxy)
pnpm --filter @rpg/dashboard build      # vite build under the /app/ base
pnpm --filter @rpg/dashboard preview    # preview the production build
pnpm --filter @rpg/dashboard test       # vitest (auth-guard redirect unit test)
pnpm --filter @rpg/dashboard typecheck
pnpm --filter @rpg/dashboard lint
```

See [`docs/auth-guard.md`](./docs/auth-guard.md) for the auth-guard data flow
and [`docs/feature-conventions.md`](./docs/feature-conventions.md) for the
feature-folder convention.
