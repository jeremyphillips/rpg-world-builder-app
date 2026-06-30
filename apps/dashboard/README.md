# @rpg/dashboard

The authenticated DM workspace — a Vite + React single-page app served under
`/app`. It is the destination of the public app's login handshake: an
unauthenticated visit bounces back to the public `/login`.

## Base path

The app is built and served with `base: "/app/"` (`vite.config.ts`) so it sits
behind the single-origin dev proxy next to the public app (`/`), Dev Bench
(`/bench`), and the API (`/api`). React Router uses the matching `basename`
(derived from `import.meta.env.BASE_URL`), so in-app routes resolve under
`/app`.

## Single-origin / proxy assumption

The dashboard talks to the API with **relative, same-origin** requests
(`fetch("/api/auth/...")`) and `credentials: "include"`. There is no API base
URL and no CORS. That only resolves behind the dev reverse proxy (or the prod
equivalent), which routes `/api` to the Express server — see the
[root README](../../README.md). Running `vite` alone will 404 on `/api`; use
`pnpm dev` from the repo root to bring up the proxy + all apps.

## Auth

`AuthGuard` (`src/features/auth`) wraps the routed app: it queries
`GET /api/auth/me` (TanStack Query, no retry), shows a loading state while
in flight, renders the shell on success, or redirects to `/login` on `401`.
Logout calls `POST /api/auth/logout` with the CSRF header, then redirects to
`/login`.

See [`docs/auth-guard.md`](./docs/auth-guard.md) for the full data-flow diagram.

## Architecture

```text
src/
  app/           providers, router, routes.ts, lazy-routes, breadcrumbs
  components/    layout shells (AppShell, NarrowPage, WidePage, PageHeader, …)
  features/      feature-first domains (see status table below)
  lib/           shared data-table helpers, form guards, api utilities
  routes/        top-level screens (home, profile, admin, character stub, …)
```

Route screens lazy-load via [`src/app/lazy-routes.ts`](src/app/lazy-routes.ts).
Cross-feature imports must go through each feature's `index.ts` barrel (ESLint
enforced). Navigation paths live in [`src/app/routes.ts`](src/app/routes.ts) —
see [routing conventions](../../docs/routing.md).

Tailwind v4 is wired through the `@tailwindcss/vite` plugin. Shared packages:

| Package           | Role                                              |
| ----------------- | ------------------------------------------------- |
| `@rpg/ui`         | primitives, design tokens, schema-driven `<Form>` |
| `@rpg/contracts`  | domain/DTO types (Zod-inferred)                   |
| `@rpg/api-client` | CSRF-aware fetch helpers (`fetchSession`, …)      |
| `@rpg/catalog`    | SRD seed data for Storybook fixtures and tests    |

Server state uses TanStack Query; apps wrap `@rpg/api-client` in feature hooks
locally (e.g. `useSession`, `useLogout`).

### Feature status

| Feature / area                                                                               | Status      |
| -------------------------------------------------------------------------------------------- | ----------- |
| `auth`, `user`, `campaign`                                                                   | Implemented |
| `content` — classes, species, feats, spells, equipment (family modules), skill proficiencies | Implemented |
| `homebrew` — vocabulary sets, rules configuration                                            | Implemented |
| `character`, `message`, `notification`                                                       | Scaffold    |
| `content/monsters`, `content/locations`                                                      | Scaffold    |

Campaign-scoped catalog routes live under `/campaigns/:campaignId/…`. The home
route is a campaign picker with a one-shot landing redirect
([`src/routes/dashboard-home.tsx`](src/routes/dashboard-home.tsx)).

Folder layout, layout shells, Storybook rules, and catalog UI recipes:
[`docs/feature-conventions.md`](./docs/feature-conventions.md).

## Storybook

Co-located `*.stories.tsx` files run in the **dashboard** Storybook instance
(`pnpm storybook:dashboard`, port **6007**). Primitives and form recipes belong
in `@rpg/ui` Storybook (`pnpm storybook:ui`, port \*\*6006`) instead.

The dashboard preview wraps every story in `MemoryRouter` — do not nest another
router in story decorators. Detail in the Storybook section of
[`docs/feature-conventions.md`](./docs/feature-conventions.md).

## Commands

```sh
pnpm --filter @rpg/dashboard dev           # vite dev on :5173 (use root `pnpm dev` for the proxy)
pnpm --filter @rpg/dashboard build         # vite build under the /app/ base
pnpm --filter @rpg/dashboard preview       # preview the production build
pnpm --filter @rpg/dashboard test          # vitest unit tests
pnpm --filter @rpg/dashboard typecheck
pnpm --filter @rpg/dashboard lint
pnpm --filter @rpg/dashboard storybook     # composition stories on :6007
pnpm --filter @rpg/dashboard analyze       # production build + bundle treemap
```

Root shorthands: `pnpm storybook:dashboard`, `pnpm storybook` (UI + dashboard).

## Documentation

- [feature-conventions.md](./docs/feature-conventions.md) — feature folders, layout shells, Storybook, catalog UI recipes
- [code-splitting.md](./docs/code-splitting.md) — lazy routes, bundle analyzer
- [auth-guard.md](./docs/auth-guard.md) — session gate and redirect flow
- [content-types.md](../../docs/content-types.md) — adding a new catalog content type (contracts-first)
- [vocabulary.md](../../docs/vocabulary.md) — homebrew vocabulary sets
- [routing.md](../../docs/routing.md) — `ROUTES` constants and navigation conventions
