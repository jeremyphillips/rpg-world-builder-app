# subclasses (API)

Nested under **classes** — not a top-level content type in `content-types.ts`.

## Ownership model

| Layer             | Source                                          | Persistence                           |
| ----------------- | ----------------------------------------------- | ------------------------------------- |
| **System**        | `@rpg/catalog/classes` seed (`subclasses.json`) | Read-only; ids `"<rulesetId>:<slug>"` |
| **Homebrew**      | `HomebrewSubclassModel`                         | Campaign-owned Mongo docs             |
| **Overlay patch** | `SubclassPatchModel`                            | Per-campaign partial edits            |
| **Availability**  | `SubclassCampaignAvailabilityModel`             | Per-campaign active/inactive toggle   |

List responses merge system → patches → homebrew for the route `classId` and attach
`activeInCampaign` (default `true` when no availability row exists). Inactive rows remain
in the list.

## Routes

Mounted under `/api/campaigns/:campaignId/content` (before `/:contentType`).

| Method | Path                                                             | Role           | Description                          |
| ------ | ---------------------------------------------------------------- | -------------- | ------------------------------------ |
| GET    | `/classes/:classId/subclasses`                                   | member         | Resolved subclasses + availability   |
| POST   | `/classes/:classId/subclasses`                                   | owner/co-owner | Create homebrew subclass             |
| PATCH  | `/classes/:classId/subclasses/:subclassId`                       | owner/co-owner | Update homebrew or system patch      |
| PATCH  | `/classes/:classId/subclasses/:subclassId/availability`          | owner/co-owner | Upsert `activeInCampaign`            |
| GET    | `/classes/:classId/subclasses/:subclassId/deletion-availability` | owner/co-owner | Delete preflight                     |
| DELETE | `/classes/:classId/subclasses/:subclassId`                       | owner/co-owner | Delete homebrew (`409` when blocked) |

Route `classId` is authoritative on create/update (injected on POST; body `classId` on PATCH
must match or be omitted).

## Module map

| File                                      | Role                                  |
| ----------------------------------------- | ------------------------------------- |
| `list-subclasses.ts`                      | Resolve + list + availability upsert  |
| `subclass-write.handlers.ts`              | Nested write/delete route adapters    |
| `subclasses.config.ts`                    | Write kernel config                   |
| `homebrew-subclass.model.ts`              | Homebrew Mongo schema                 |
| `subclass-patch.model.ts`                 | Overlay patch model                   |
| `subclass-campaign-availability.model.ts` | Availability rows                     |
| `assert-subclass-parent-class.ts`         | Parent class + route `classId` guards |

Dashboard counterpart: `apps/dashboard/src/features/content/classes/` (subclasses tab + `api/subclasses-api.ts`).
