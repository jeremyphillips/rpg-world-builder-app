# Vocabulary (dashboard)

Campaign vocabulary **consumption** — API clients, TanStack Query hooks, per-set
option maps, field factories, labels, and the reusable entry form model.

Game Terms authoring UI lives in [`game-terms`](../game-terms/README.md). Import
this feature from `@/features/vocabulary` (or `sets.ts` / `fields.ts` entry
points); do not import `game-terms` for labels or option hooks.

Ruleset patch hooks remain in [`homebrew`](../homebrew) — unrelated to this
feature. See [vocabulary.md](../../../../docs/vocabulary.md).

## Batch disable preflight

Bulk vocabulary availability validate uses:

`POST /api/campaigns/:campaignId/vocabulary/:setId/entries/disable-availability/batch`

| Rule                        | Behavior                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Auth                        | owner / co-owner                                                                    |
| Request                     | `{ targets: [{ entryId }] }` — unique IDs, 1–50 entries                             |
| Response                    | `{ targets: [{ targetId, targetName, availability \| failure }] }` in request order |
| Sets without `disableGuard` | `200` with all targets `{ availability: { status: 'allowed' } }`                    |
| Per-target not found        | `200` with `{ failure: { code: 'not_found', message: … } }`                         |

Dashboard client: `fetchVocabularyDisableAvailabilityBatch` →
`mapVocabularyDisableAvailabilityBatchResponse`. Single-item
`GET …/entries/:entryId/disable-availability` remains for detail surfaces.
