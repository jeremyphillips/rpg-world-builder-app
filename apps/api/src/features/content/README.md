# content (API feature)

Owns the system content catalog and serves each campaign its **resolved**
catalog. Content shapes are defined contracts-first in `@rpg/contracts`; this
feature owns persistence and serving. `classes` is the first content type;
`spells`, `monsters`, `species`, and `equipment` plug into the same kernel.

## Ownership model

- **System content** ships from `@rpg/catalog` (versioned seed JSON validated at
  module load). It is read-only and never mutated. Ids are deterministic
  (`"<rulesetId>:<slug>"`).
- **Homebrew** content is campaign-owned and stored in Mongo
  (`source: 'homebrew'`, `campaignId` set, Mongo-generated id).
- **Overlay patches** are per-campaign partial edits to a system record
  (`ClassPatchModel`), keyed by the base record's `targetId`. The system seed is
  never edited in place.

Integration wiring for each top-level type is indexed in
[`tools/content-types`](../../../../tools/content-types/README.md)
(`CONTENT_TYPE_INTEGRATION_MANIFEST`). Nested resources such as subclasses are
outside that manifest.

A campaign pins a `rulesetId` (see the campaign contract/model); it determines
which seed version is loaded and which content homebrew/patches validate against.

## Subclasses (nested under classes)

Subclasses are **not** a top-level entry in `content-types.ts`. They live under
`subclasses/` and are nested under a parent class id.

| Layer               | Source                       | API today                                                     |
| ------------------- | ---------------------------- | ------------------------------------------------------------- |
| **System**          | `@rpg/catalog/classes` seed  | `GET …/content/classes/:classId/subclasses` (catalog read)    |
| **Homebrew**        | `HomebrewSubclassModel`      | `POST/PATCH/DELETE …/classes/:classId/subclasses/:subclassId` |
| **Overlay patch**   | `SubclassPatchModel`         | Partial edits on system ids via nested PATCH                  |
| **Campaign access** | `ContentCampaignAccessModel` | `GET/PATCH …/subclasses/:subclassId/campaign-access`          |

See [`subclasses/README.md`](subclasses/README.md) and
[`docs/content-types.md`](../../../../../docs/content-types.md) § Subclass ownership.
Nested subclasses are **not** entries in `CONTENT_TYPE_INTEGRATION_MANIFEST`.

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

- `POST /api/campaigns/:campaignId/content/:contentType` — create homebrew (`status` in request body; defaults to `published`)
- `PATCH /api/campaigns/:campaignId/content/:contentType/:entityId` — update
  homebrew or upsert a system overlay patch (owner/co-owner only)
- `POST /api/campaigns/:campaignId/content/:contentType/:entityId/publish` —
  promote a homebrew draft to published (owner/co-owner only)
- `GET /api/campaigns/:campaignId/content/:contentType/:entityId/demotion-availability` —
  advisory demote preflight (owner/co-owner only)
- `POST /api/campaigns/:campaignId/content/:contentType/:entityId/demote` —
  demote published homebrew to draft (owner/co-owner only; `409` when blocked)
- `GET /api/campaigns/:campaignId/content/:contentType/:entityId/deletion-availability` —
  advisory delete preflight (owner/co-owner only)
- `GET /api/campaigns/:campaignId/content/:contentType/:entityId/usage` —
  informational character usage references (any campaign role; registration-gated)
- `DELETE /api/campaigns/:campaignId/content/:contentType/:entityId` — delete homebrew
  (owner/co-owner only; `409` when blocked by character usage)
- `GET /api/campaigns/:campaignId/content/:contentType/:entityId/campaign-access-availability` —
  advisory availability-off preflight (owner/co-owner only)
- `PATCH /api/campaigns/:campaignId/content/:contentType/:entityId/campaign-access` —
  persist campaign access (`available`, `visibilityMode`, `participantIds`; `409` when
  turning off is blocked by character usage)
- Nested subclasses: `GET/PATCH …/classes/:classId/subclasses/:subclassId/campaign-access*`
  (same semantics; `targetType: 'subclasses'` in `ContentCampaignAccessModel`)

List responses attach resolved `campaignAccess` on every row (default available /
`all_players`). When a type registers batch usage sources, rows also include
`usedBy` / optional `usedBySummary`, and the response may include
`usageSummaryLabels` + `overviewUsageScope` (descriptive metadata for overview
chrome — does not change resolver topology). See
`lib/content-usage/` and [`docs/content-types.md`](../../../../../docs/content-types.md)
§ Delete homebrew content.

Availability-off hides future discovery only — it does not remove
existing character references. See
[`lib/content-campaign-access-policy.test.ts`](lib/content-campaign-access-policy.test.ts).

`GET /api/campaigns/:campaignId/content/:contentType` filters `status: 'draft'` records
for campaign members who are not `owner`/`co-owner`.

See `lib/content-write.service.ts`, `lib/content-status.service.ts`, and each type's
`*Registration.write` in `*.config.ts`.

### Write baseline regression (all six types)

Service-level homebrew create, homebrew update, and system overlay patch for
every registered catalog type are covered in
[`lib/content-write-baseline.test.ts`](lib/content-write-baseline.test.ts).
HTTP POST/PATCH smoke tests live in
[`content.routes.test.ts`](content.routes.test.ts) (`content write routes`).
Run these before landing spell-resolution or subclass persistence work.

## Homebrew hub summary

Mounted under `/api/campaigns/:campaignId/homebrew`.

| Method | Path       | Role   | Description                                                                                        |
| ------ | ---------- | ------ | -------------------------------------------------------------------------------------------------- |
| GET    | `/summary` | member | Resolved catalog counts for hub cards (`HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS` in `content-types.ts`) |

System seed records ship from `@rpg/catalog`; the API never stores a full catalog copy.

## Attribution

The SRD 5.2.1 seed is CC-BY-4.0; see the repo-root [`NOTICE`](../../../../../NOTICE).
