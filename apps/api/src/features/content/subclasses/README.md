# subclasses (API)

Nested under **classes** — not a top-level content type in `content-types.ts`.

## Ownership model

| Layer               | Source                                                    | Persistence                            |
| ------------------- | --------------------------------------------------------- | -------------------------------------- |
| **System**          | `@rpg/catalog/classes` seed (`subclasses.json`)           | Read-only; ids `"<rulesetId>:<slug>"`  |
| **Homebrew**        | `HomebrewSubclassModel`                                   | Campaign-owned Mongo docs              |
| **Overlay patch**   | `SubclassPatchModel`                                      | Per-campaign partial edits             |
| **Campaign access** | `ContentCampaignAccessModel` (`targetType: 'subclasses'`) | Per-campaign availability + visibility |

List responses merge system → patches → homebrew for the route `classId` and attach
`campaignAccess` (default available / `all_players` when no row exists).

## Routes

Mounted under `/api/campaigns/:campaignId/content` (before `/:contentType`).

| Method | Path                                                                    | Role           | Description                           |
| ------ | ----------------------------------------------------------------------- | -------------- | ------------------------------------- |
| GET    | `/classes/:classId/subclasses`                                          | member         | Resolved subclasses + campaign access |
| POST   | `/classes/:classId/subclasses`                                          | owner/co-owner | Create homebrew subclass              |
| PATCH  | `/classes/:classId/subclasses/:subclassId`                              | owner/co-owner | Update homebrew or system patch       |
| GET    | `/classes/:classId/subclasses/:subclassId/campaign-access-availability` | owner/co-owner | Availability-off preflight            |
| PATCH  | `/classes/:classId/subclasses/:subclassId/campaign-access`              | owner/co-owner | Upsert campaign access                |
| GET    | `/classes/:classId/subclasses/:subclassId/deletion-availability`        | owner/co-owner | Delete preflight                      |
| DELETE | `/classes/:classId/subclasses/:subclassId`                              | owner/co-owner | Delete homebrew (`409` when blocked)  |

Route `classId` is authoritative on create/update (injected on POST; body `classId` on PATCH
must match or be omitted).

## Module map

| File                                      | Role                                  |
| ----------------------------------------- | ------------------------------------- |
| `list-subclasses.ts`                      | Resolve + list                        |
| `subclass-write.handlers.ts`              | Nested write/delete route adapters    |
| `subclasses.config.ts`                    | Write kernel config                   |
| `homebrew-subclass.model.ts`              | Homebrew Mongo schema                 |
| `subclass-patch.model.ts`                 | Overlay patch model                   |
| `../lib/content-campaign-access.model.ts` | Shared campaign access rows           |
| `assert-subclass-parent-class.ts`         | Parent class + route `classId` guards |

Dashboard counterpart: `apps/dashboard/src/features/content/classes/` (subclasses tab + `api/subclasses-api.ts`).
