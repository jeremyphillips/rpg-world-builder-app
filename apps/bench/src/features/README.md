# Feature-folder conventions

Dev Bench follows the same feature-first layout as the dashboard. Each domain
area lives under `src/features/<feature>/` and owns its UI, hooks, and data access
as it grows.

## Layout

| Folder        | Responsibility                                           |
| ------------- | -------------------------------------------------------- |
| `components/` | React components/widgets for this feature                |
| `routes/`     | Route-level screens mounted in the app router            |
| `hooks/`      | React hooks (data access via TanStack Query)             |
| `*.api.ts`    | Same-origin API client wrappers (e.g. `tickets.api.ts`)  |
| `index.ts`    | Public barrel — the **only** entry other features import |

Do **not** re-export route screens from `index.ts`. The app router lazy-loads
route modules directly (`src/app/lazy-routes.ts`).

Cross-feature imports go only through each feature's `index.ts` (ESLint-enforced
via `@rpg/config/eslint/react`).

Dashboard detail: [apps/dashboard/docs/feature-conventions.md](../../dashboard/docs/feature-conventions.md).

## Storybook deferral

Co-located `*.stories.tsx` for bench components are deferred to feature plans
(04–06). This is an explicit exception to the global AGENTS.md Storybook rule
for `@rpg/bench` only.
