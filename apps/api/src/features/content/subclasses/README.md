# subclasses (API)

Nested under **classes** — not a top-level content type in `content-types.ts`.

## Ownership model

| Layer             | Source                                          | Persistence                           |
| ----------------- | ----------------------------------------------- | ------------------------------------- |
| **System**        | `@rpg/catalog/classes` seed (`subclasses.json`) | Read-only; ids `"<rulesetId>:<slug>"` |
| **Homebrew**      | _Not implemented_                               | Future: campaign-owned Mongo docs     |
| **Overlay patch** | _Not implemented_                               | Future: per-campaign partial edits    |

Today the API serves **catalog seed only**. The dashboard class editor's Subclasses tab
authors in **local component state** (drafts/edits) and does not persist to the API yet.

Target (follow-on): mirror the class homebrew pattern — nested write routes, optional
patch model, and `subclasses.config.ts` registration when dashboard saves to the API.

## Routes

Mounted under `/api/campaigns/:campaignId/content`.

| Method | Path                           | Role   | Handler              | Description                         |
| ------ | ------------------------------ | ------ | -------------------- | ----------------------------------- |
| GET    | `/classes/:classId/subclasses` | member | `list-subclasses.ts` | Catalog subclasses for one class id |

Future (not in this milestone):

| Method | Path                                       | Role           | Description              |
| ------ | ------------------------------------------ | -------------- | ------------------------ |
| POST   | `/classes/:classId/subclasses`             | owner/co-owner | Create homebrew subclass |
| PATCH  | `/classes/:classId/subclasses/:subclassId` | owner/co-owner | Update homebrew or patch |

## Module map

| File                 | Role                                          |
| -------------------- | --------------------------------------------- |
| `list-subclasses.ts` | Catalog read (`resolveSubclassesForCampaign`) |

Planned: `homebrew-subclass.model.ts`, `subclass-patch.model.ts`, `subclasses.config.ts`.

Dashboard counterpart: `apps/dashboard/src/features/content/classes/` (subclasses tab + `api/subclasses-api.ts`).
