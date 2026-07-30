# @rpg/bench

Dev Bench — a lightweight local workbench for managing tickets, epics, and agent-assisted planning. Vite + React SPA served under `/bench/`.

## Base path

The app is built and served with `base: "/bench/"` (`vite.config.ts`) so it sits
behind the single-origin dev proxy next to the public app (`/`), dashboard
(`/app`), and API (`/api`). React Router uses the matching `basename` (derived
from `import.meta.env.BASE_URL`), so in-app routes resolve under `/bench`.

## URLs

| Context                  | URL                            |
| ------------------------ | ------------------------------ |
| Dev proxy (preferred)    | `http://localhost:8080/bench/` |
| Vite dev server (direct) | `http://localhost:5174/bench/` |

Always use the **proxy origin** for API calls — relative paths like
`fetch("/api/bench/tickets")` only resolve correctly when the browser is on
`:8080`. Visiting the Vite port directly will 404 on `/api/...`.

Bare `/bench` redirects to `/bench/` at the proxy (same as `/app` → `/app/`).

## Auth

No auth for MVP — Dev Bench is a local solo-dev tool. The bench API
(`/api/bench/*`) does not require a session.

## Layout

```text
src/
  main.tsx
  index.css               # @rpg/ui preset
  app/                    # providers, router, lazy routes
  components/layout/      # AppShell, sidebar (NavSection + sidebarNavItemVariants)
  features/               # feature-first placeholders → CRUD in plans 04–06
  lib/api/                # shell API helper (feature clients in later plans)
```

Sidebar IA is built by `buildBenchSidebarSections()` — Work (Bench, Epics,
Backlog) and Settings sections. Shared nav primitives come from `@rpg/ui`;
dashboard campaign nav validates `SidebarNavSectionDisclosure`. See
[dashboard sidebar-navigation.md](../dashboard/docs/sidebar-navigation.md).

Feature conventions: [src/features/README.md](src/features/README.md).

## Scripts

```bash
pnpm --filter @rpg/bench dev        # Vite on :5174 (open /bench/)
pnpm --filter @rpg/bench build
pnpm --filter @rpg/bench typecheck
pnpm --filter @rpg/bench lint
pnpm --filter @rpg/bench test
```

From the repo root, `pnpm dev` starts the proxy and all app dev servers
(including bench) via Turbo.
