# Tickets feature

Ticket CRUD UI for Dev Bench: backlog list with filters, quick-create dialog, full
detail edit, and a backlog drawer (`?ticketId=`).

## Layout

| Path                 | Screen                                         |
| -------------------- | ---------------------------------------------- |
| `/backlog`           | Filtered backlog list + create + detail drawer |
| `/tickets/:ticketId` | Full-page ticket edit                          |

## Data access

- API client: `api/tickets-client.ts` (CSRF-free mutations via `request()`)
- TanStack Query hooks in `hooks/`
- Query key namespace: `['bench', 'tickets', …]` — includes `ticketQueryKeys.bench()` for the workflow board (plan 06)

## Cross-feature exports

Import display components and hooks from `features/tickets/index.ts` only. Route
screens are lazy-loaded from `routes/` — not re-exported from the barrel.

Plan 05 moved epic data access to `features/epics` — import `useEpicsList` from `@/features/epics`.
