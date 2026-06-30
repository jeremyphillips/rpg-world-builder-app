# Dev Bench API

MongoDB-backed CRUD for Dev Bench tickets and epics under `/api/bench/*`.

## Collections

| Collection                 | Model                      | Purpose                                                  |
| -------------------------- | -------------------------- | -------------------------------------------------------- |
| `devBenchTickets`          | `DevBenchTicket`           | Work items with server-assigned `BENCH-###` keys         |
| `devBenchEpics`            | `DevBenchEpic`             | Initiative groupings                                     |
| `devBenchTicketKeyCounter` | `DevBenchTicketKeyCounter` | Atomic ticket key sequence (singleton `_id: ticket-key`) |

## CSRF (MVP)

`/api/bench` routes are **exempt** from the global double-submit CSRF guard while Dev Bench
has no auth/session. Dev Bench UI and CLI call these endpoints without a login flow.

Re-enable CSRF on `/api/bench` when Dev Bench auth lands.

## Production gate

The API mounts `/api/bench` only when `DEV_BENCH_ENABLED` resolves to true (`src/env.ts`):

- **Default:** enabled in `development` and `test`, **disabled** in `production`
- **Override:** set `DEV_BENCH_ENABLED=true` or `false` explicitly in `apps/api/.env`

Because bench routes are unauthenticated, leave the default off in production unless you
deliberately expose the workbench API.

## Ticket keys

Clients must not supply `key` on create. Keys are assigned atomically in the service via
`formatTicketKey()` from `@rpg/contracts/dev-bench`.
