# Bench feature

Near-term workflow board: four columns (Up Next, In Progress, Blocked, Done),
card overflow status moves, and quick create into Up Next.

## Route

| Path | Component                                          |
| ---- | -------------------------------------------------- |
| `/`  | `BenchHome` — workflow board + `?ticketId=` drawer |

## Data access

- `useBenchTickets` — single `GET /api/bench/tickets` via `fetchTickets()` from `@/features/tickets`, client-bucketed with `@rpg/dev-bench-core`
- Query key: `ticketQueryKeys.bench()` under `['bench', 'tickets', 'bench']`
- Status moves: `useMoveTicketStatus` wraps `useUpdateTicket` from tickets feature

Ticket create/update/delete hooks invalidate the bench query key so the board stays in sync with Backlog and Epics.

## Cross-feature imports

- `TicketCard`, `TicketCreateDialog`, `TicketDetailDrawer`, `fetchTickets`, `useUpdateTicket` from `@/features/tickets`
- `useEpicsList` from `@/features/epics` for epic labels on cards

Import display components and hooks from `features/bench/index.ts` only. Route page is lazy-loaded from `routes/bench-home.tsx`.
