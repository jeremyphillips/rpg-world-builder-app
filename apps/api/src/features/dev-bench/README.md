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

## Ticket keys

Clients must not supply `key` on create. Keys are assigned atomically in the service via
`formatTicketKey()` from `@rpg/contracts/dev-bench`.
