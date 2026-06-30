# content (API feature)

Owns the system content catalog and serves each campaign its **resolved**
catalog. Content shapes are defined contracts-first in `@rpg/contracts`; this
feature owns persistence and serving. `classes` is the first content type;
`spells`, `monsters`, `species`, and `equipment` plug into the same kernel.

## Ownership model

- **System content** ships as a versioned seed (`classes/data/<rulesetId>/`),
  validated against the contract at module load. It is read-only and never
  mutated. Ids are deterministic (`"<rulesetId>:<slug>"`).
- **Homebrew** content is campaign-owned and stored in Mongo
  (`source: 'homebrew'`, `campaignId` set, Mongo-generated id).
- **Overlay patches** are per-campaign partial edits to a system record
  (`ClassPatchModel`), keyed by the base record's `targetId`. The system seed is
  never edited in place.

A campaign pins a `rulesetId` (see the campaign contract/model); it determines
which seed version is loaded and which content homebrew/patches validate against.

## Subclasses (nested under classes)

Subclasses are **not** a top-level entry in `content-types.ts`. They live under
`subclasses/` and are nested under a parent class id.

| Layer             | Source                         | API today                                                  |
| ----------------- | ------------------------------ | ---------------------------------------------------------- |
| **System**        | `@rpg/catalog/classes` seed    | `GET …/content/classes/:classId/subclasses` (catalog read) |
| **Homebrew**      | _Planned_ — campaign-owned     | No write routes yet                                        |
| **Overlay patch** | _Planned_ — per-campaign edits | No patch model yet                                         |

The dashboard class editor's **Subclasses** tab authors in local component state
(drafts/edits) and does not persist to the API. Target: nested homebrew/patch
routes mirroring the class pattern — see [`subclasses/README.md`](subclasses/README.md).

## Resolve / merge algorithm

`GET /api/campaigns/:campaignId/content/classes` returns the resolved catalog.
`resolveCatalogForCampaign` (in `content.service.ts`) does, per content type:

1. Load the campaign and its `rulesetId`.
2. `loadSystem(rulesetId)` — the seed records.
3. `loadPatches(campaignId)` and `loadHomebrew(campaignId, rulesetId)` from Mongo.
4. `resolveCatalog(system, patches, homebrew)` (in `lib/`):
   - deep-merge each patch onto its target by id (`deepMerge`: nested objects
     merge, **arrays and primitives replace wholesale**),
   - append homebrew records.
   - Patches whose target no longer exists in the seed are ignored.

## Kernel (`lib/`) — type-agnostic, reused by every content type

| Module                        | Responsibility                                                |
| ----------------------------- | ------------------------------------------------------------- |
| `deep-merge.ts`               | Deep-merge objects; arrays/primitives replace                 |
| `resolve-catalog.ts`          | Merge system + patches + homebrew into the effective list     |
| `assert-slug-available.ts`    | Homebrew slug guard (no campaign dupes; no system shadowing)  |
| `homebrew-summary.service.ts` | Hub card counts — one round trip over resolved catalogs       |
| `content-type-config.ts`      | `ContentTypeConfig` — the per-type wiring the kernel consumes |

Each content type contributes only a body schema (in `@rpg/contracts`) + a
`*.config.ts` exporting a `*Registration` (`read` + `write`, optional
`resolveForCampaign`), registered once in `content-types.ts`.

- `POST /api/campaigns/:campaignId/content/:contentType` — create homebrew
- `PATCH /api/campaigns/:campaignId/content/:contentType/:entityId` — update
  homebrew or upsert a system overlay patch (owner/co-owner only)

See `lib/content-write.service.ts` and each type's `*Registration.write` in `*.config.ts`.

## Homebrew hub summary

Mounted under `/api/campaigns/:campaignId/homebrew`.

| Method | Path       | Role   | Description                                                                            |
| ------ | ---------- | ------ | -------------------------------------------------------------------------------------- |
| GET    | `/summary` | member | Resolved catalog counts for hub cards (`HOMEBREW_SUMMARY_TYPES` in `content-types.ts`) |

System seed records ship from `@rpg/catalog`; the API never stores a full catalog copy.

## Attribution

The SRD 5.2.1 seed is CC-BY-4.0; see the repo-root [`NOTICE`](../../../../../NOTICE).
