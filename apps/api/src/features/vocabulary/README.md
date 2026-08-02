# vocabulary (API feature)

Campaign ruleset vocabulary patches. System seed data lives in
`@rpg/catalog/vocabulary`; this feature stores campaign deltas in
`CampaignRulesetPatch` and merges them at read time.

## Layout

```text
vocabulary/
  index.ts              # public barrel
  lib/                  # patch-document, model, resolve-vocabulary, asserts
  sets/                 # vocabulary CRUD (/vocabulary/*)
  ruleset-patch/        # /ruleset-patch/* (character-creation + mechanics)
```

## Persistence

- **`CampaignRulesetPatchModel`** — one document per `(campaignId, rulesetId)`.
- **`vocabulary[]`** — per-set deltas only:
  - `systemEntryPatches` — label/description/status overrides for seed ids
  - `campaignEntries` — campaign-created options (`source: campaign` in responses)
  - `removedCampaignEntryIds` — tombstones for deleted campaign entries (system ids cannot be deleted)

## Resolve

`resolveVocabularySet(seed, setPatch)` merges catalog seed with stored patches.

Overview `usedBy` counts are capability-gated:

- **`usageResolution`** — attach counts to resolved options and enable usage GET.
- **`batchUsageCounting`** — one set-level count resolver per overview load (creature-types: single species catalog read). Full blocker lists are **not** built during overview attach.
- Disable/delete preflight and `GET .../usage` still resolve full blockers via per-entry usage resolvers.

Pure reference extraction lives in `lib/reference-sources/` — field-path SSOT for extract + index; catalog loading and purpose-aware character inclusion stay in orchestration one layer above.

Set-level discovery is registered via `defineVocabularyUsage` in
`lib/vocabulary-usage-registrations.ts` — each registration declares sources with
explicit `entry` / `batch` participation and derives entry/batch resolvers plus
summary labels. Product capabilities (`usageResolution`, `deleteGuard`, …) remain
independent in `@rpg/contracts`.

## Routes

Mounted under `/api/campaigns/:campaignId`.

| Method | Path                                                       | Role           | Description                                                           |
| ------ | ---------------------------------------------------------- | -------------- | --------------------------------------------------------------------- |
| GET    | `/vocabulary`                                              | member         | All resolved vocabulary sets for the campaign ruleset                 |
| GET    | `/vocabulary/:setId`                                       | member         | One resolved set with `usedBy` counts                                 |
| POST   | `/vocabulary/:setId/entries`                               | owner/co-owner | Create a campaign vocabulary entry (`create` capability)              |
| PATCH  | `/vocabulary/:setId/entries/:entryId`                      | owner/co-owner | Patch system or campaign entry (`edit` / `availability` capabilities) |
| GET    | `/vocabulary/:setId/entries/:entryId/disable-availability` | owner/co-owner | Advisory preflight before disabling (`disableGuard`)                  |
| GET    | `/vocabulary/:setId/entries/:entryId/delete-availability`  | owner/co-owner | Advisory preflight before deleting (`deleteGuard`)                    |
| GET    | `/vocabulary/:setId/entries/:entryId/usage`                | member         | Informational usage references (`usageResolution`)                    |
| DELETE | `/vocabulary/:setId/entries/:entryId`                      | owner/co-owner | Delete campaign entry (`delete` capability)                           |

Mutations assert the matching row in `VOCABULARY_SET_CAPABILITIES` (`@rpg/contracts`) and return `403` when the set does not support the operation.

## Ruleset patch

Mounted under `/api/campaigns/:campaignId/ruleset-patch`.

| Method | Path                  | Role           | Description                                                                            |
| ------ | --------------------- | -------------- | -------------------------------------------------------------------------------------- |
| GET    | `/`                   | member         | Resolved `characterCreation` and `mechanics`                                           |
| PATCH  | `/character-creation` | owner/co-owner | Partial character-creation patch (sparse)                                              |
| PATCH  | `/mechanics`          | owner/co-owner | Partial mechanics patch (sparse; server sets `editionPreset.modified` and `appliedAt`) |

`mechanics` stores edition preset selection, armor class knobs, and attack resolution mode. Defaults resolve to the **5e** preset when nothing is stored.

Id conflicts use `assertVocabularyIdAvailable` (409) — campaign ids must not shadow system seed ids.

Homebrew hub catalog counts live in the **content** feature — see
[`../content/README.md`](../content/README.md).

## Tests

Ruleset-patch integration tests: `ruleset-patch/ruleset-patch.service.test.ts`
(persist + resolve) and `ruleset-patch/ruleset-patch.routes.test.ts` (HTTP smoke).
Vocabulary set routes: `sets/vocabulary.routes.test.ts`.
Shared scaffold and catalog tier ids → [`../../docs/testing.md`](../../docs/testing.md).
