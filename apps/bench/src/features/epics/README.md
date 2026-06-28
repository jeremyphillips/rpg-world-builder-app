# Epics feature

Epic list, detail, CRUD, client-side ticket aggregation, and scoped ticket create.

## Routes

| Path             | Component                                                                              |
| ---------------- | -------------------------------------------------------------------------------------- |
| `/epics`         | `EpicsListPage` — URL-synced status/area filters, sorted cards with counts             |
| `/epics/:epicId` | `EpicDetailPage` — edit form, related code areas, ticket sections, `?ticketId=` drawer |

## Data access

All epic queries live here (`epicQueryKeys`, `useEpicsList`, CRUD hooks). Tickets feature imports
`useEpicsList` from this barrel — not the reverse for epic-specific hooks.

List counts compose `GET /api/bench/epics` + `GET /api/bench/tickets` client-side. Detail sections
use `GET /api/bench/tickets?epicId=:id` with `@rpg/dev-bench-core` bucket helpers.

Mutations use shared `benchSendJson` from `src/lib/api/bench-send-json.ts`.

## Seed epics

Canonical definitions: `SEED_EPICS` in `@rpg/dev-bench-core` (`packages/dev-bench-core/src/seed/epic-seeds.ts`).
Idempotent CLI seeding is plan 07: `pnpm bench seed-epics` (match by normalized title). No auto-seed on visit.

## Cross-feature imports

- `EpicCard` → `PriorityBadge` from `@/features/tickets`
- Epic detail → `TicketCard`, `TicketCreateDialog`, `TicketDetailDrawer` from `@/features/tickets`

Import display components and hooks from `features/epics/index.ts` only. Route pages are lazy-loaded
from `routes/` (not via barrel).
