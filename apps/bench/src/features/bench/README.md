# Bench feature

Near-term workflow board: four columns (Up Next, In Progress, Blocked, Done),
drag-and-drop lane moves, card overflow status moves, and quick create into Up Next.

## Route

| Path | Component                                          |
| ---- | -------------------------------------------------- |
| `/`  | `BenchHome` — workflow board + `?ticketId=` drawer |

## Data access

- `useBenchTickets` — single `GET /api/bench/tickets` via `fetchTickets()` from `@/features/tickets`, client-bucketed with `@rpg/dev-bench-core`
- Query key: `ticketQueryKeys.bench()` under `['bench', 'tickets', 'bench']`
- Status moves: `useBenchBoardMoves` on the board (drag + overflow menu) patches ticket status via `updateTicket`

Ticket create/update/delete hooks invalidate the bench query key so the board stays in sync with Backlog and Epics.

## Drag and drop

Lane moves use `@dnd-kit/core` as a **direct dependency of `@rpg/bench`** (not `@rpg/ui`). Kanban cross-column drops are bench-specific workflow UI; `@rpg/ui` keeps `@dnd-kit` for vertical reorder patterns (DataTable column panel). `@rpg/dev-bench-core` stays framework-free.

Drag styling lives in [`components/bench-board.variants.ts`](components/bench-board.variants.ts) (column layout, drop-target fill, grab cursor, overlay). Bench cards use `TicketCard` with `interactive={false}` so the drag surface is a plain div; the overflow menu sits outside the draggable area for a11y.

## Cross-feature imports

- `TicketCard`, `TicketCreateDialog`, `TicketDetailDrawer`, `fetchTickets`, `useUpdateTicket` from `@/features/tickets`
- `useEpicsList` from `@/features/epics` for epic labels on cards

Import display components and hooks from `features/bench/index.ts` only. Route page is lazy-loaded from `routes/bench-home.tsx`.
