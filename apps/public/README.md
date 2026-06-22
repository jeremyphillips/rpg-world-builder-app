# @rpg/public

The public-facing Next.js (App Router) app: the marketing landing page plus the
**only** place users log in and sign up. On a successful auth handshake it sends
the browser to the dashboard at `/app/`.

## Routes

| Route     | Type   | Purpose                                                 |
| --------- | ------ | ------------------------------------------------------- |
| `/`       | Server | Landing page — `SiteHeader` + `SiteHero` + `SiteFooter` |
| `/login`  | Server | Renders the client `LoginForm` (guest-only via redirect) |
| `/signup` | Server | Renders the client `SignupForm` (guest-only via redirect) |

Forms are client components built with `react-hook-form` + `@hookform/resolvers/zod`,
validating against the shared schemas in [`@rpg/contracts`](../../packages/contracts)
(`loginInputSchema`, `registerInputSchema`). UI comes from [`@rpg/ui`](../../packages/ui).

## Single-origin / proxy assumption

The app talks to the API with **relative, same-origin** requests
(`fetch("/api/auth/...")`). There is no API base URL and no CORS. That only
resolves when the app is served behind the dev reverse proxy (or the prod
equivalent), which routes `/api` to the Express server — see the
[root README](../../README.md). Running `next dev` alone will 404 on `/api`;
use `pnpm dev` from the repo root to bring up the proxy + all apps.

### Auth handshake

1. The form requests `GET /api/auth/csrf` to obtain a double-submit token.
2. It `POST`s to `/api/auth/login` (or `/register`) with the `x-csrf-token`
   header and `credentials: "include"`.
3. On success the API sets the host-only session cookie and the form does a
   relative redirect to `CROSS_APP_PATHS.dashboard` (`/app/`). Signup registers,
   then logs in, so new users land authenticated.

### Session & header

`AppProviders` wraps the root layout with TanStack Query (`retry: false`,
`staleTime: 30s`, matching the dashboard). `useSession()` calls
`GET /api/auth/me` via [`@rpg/api-client`](../../packages/api-client) and
returns `AuthMeResponse` (`user` + `activeCampaign`).

When a session exists, `SiteHeader` shows an avatar dropdown (Dashboard, Profile,
Account Settings, Sign out). When not, it shows Log in / Sign up links. Login and
signup pages use `AuthRedirect` to send authenticated visitors back to `/app/`.

Detail: [auth-forms.md](./docs/auth-forms.md).

## Layout

```text
src/
  app/
    layout.tsx          # root layout + AppProviders (TanStack Query)
    query-client.ts     # shared QueryClient defaults
    providers.client.tsx
    globals.css         # imports @rpg/ui preset + @source for class scanning
    page.tsx            # landing
    login/page.tsx
    signup/page.tsx
  components/            # SiteHeader, SiteHeaderNav (client), SiteHero, SiteFooter
  features/
    auth/               # feature-first: forms, hooks, api client (public via index.ts)
      components/        # LoginForm, SignupForm, AuthRedirect ("use client")
      hooks/             # useSession, useLogout
      api/auth-client.ts # login/register wrappers; re-exports fetchSession/logout
  lib/routes.ts         # public-only paths; cross-app paths from CROSS_APP_PATHS
```

Tailwind v4 is wired through PostCSS (`postcss.config.mjs`); workspace packages
that ship TS source are listed in `transpilePackages` (`next.config.ts`).

## Commands

```sh
pnpm --filter @rpg/public dev        # next dev on :3000 (use root `pnpm dev` for the proxy)
pnpm --filter @rpg/public build      # next build
pnpm --filter @rpg/public start      # next start on :3000
pnpm --filter @rpg/public test       # vitest + RTL form/nav tests
pnpm --filter @rpg/public typecheck
pnpm --filter @rpg/public lint
```
