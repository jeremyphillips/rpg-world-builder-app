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

| Module                     | Responsibility                                                |
| -------------------------- | ------------------------------------------------------------- |
| `deep-merge.ts`            | Deep-merge objects; arrays/primitives replace                 |
| `resolve-catalog.ts`       | Merge system + patches + homebrew into the effective list     |
| `assert-slug-available.ts` | Homebrew slug guard (no campaign dupes; no system shadowing)  |
| `content-type-config.ts`   | `ContentTypeConfig` — the per-type wiring the kernel consumes |

Each content type contributes only a body schema (in `@rpg/contracts`) + a
`*.config.ts` wiring its seed loader and Mongo models, registered in
`content-types.ts` (one entry, the single extension point). Authoring / patching
**write** endpoints are a later phase; the contracts (`createClassInput`,
`updateClassInput`, `classPatchSchema`) and the slug guard they will use already
exist here.

## Attribution

The SRD 5.2.1 seed is CC-BY-4.0; see the repo-root [`NOTICE`](../../../../../NOTICE).
