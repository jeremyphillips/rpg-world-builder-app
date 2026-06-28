# vocabulary (API feature)

Campaign ruleset vocabulary patches and the Homebrew hub summary. System seed
data lives in `@rpg/catalog/vocabulary`; this feature stores campaign deltas in
`CampaignRulesetPatch` and merges them at read time.

## Persistence

- **`CampaignRulesetPatchModel`** — one document per `(campaignId, rulesetId)`.
- **`vocabulary[]`** — per-set deltas only:
  - `systemEntryPatches` — label/description/status overrides for seed ids
  - `campaignEntries` — campaign-created options (`source: campaign` in responses)
  - `removedCampaignEntryIds` — tombstones for deleted campaign entries (system ids cannot be deleted)

## Resolve

`resolveVocabularySet(seed, setPatch)` merges catalog seed with stored patches.
`countVocabularyOptionUsage` is stubbed to `0` until reference tracking exists.

## Routes

Mounted under `/api/campaigns/:campaignId`.

| Method | Path                                  | Role           | Description                                                                                             |
| ------ | ------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| GET    | `/vocabulary`                         | member         | All resolved vocabulary sets for the campaign ruleset                                                   |
| GET    | `/vocabulary/:setId`                  | member         | One resolved set with `usedBy` counts                                                                   |
| POST   | `/vocabulary/:setId/entries`          | owner/co-owner | Create a campaign vocabulary entry                                                                      |
| PATCH  | `/vocabulary/:setId/entries/:entryId` | owner/co-owner | Patch system or campaign entry                                                                          |
| DELETE | `/vocabulary/:setId/entries/:entryId` | owner/co-owner | Delete campaign entry (stub allows when `usedBy === 0`)                                                 |
| GET    | `/homebrew/summary`                   | member         | Resolved catalog counts for hub cards (classes, spells, species, feats, equipment, skill proficiencies) |

## Ruleset patch

Mounted under `/api/campaigns/:campaignId/ruleset-patch`.

| Method | Path                  | Role           | Description                                                                            |
| ------ | --------------------- | -------------- | -------------------------------------------------------------------------------------- |
| GET    | `/`                   | member         | Resolved `characterCreation` and `mechanics`                                           |
| PATCH  | `/character-creation` | owner/co-owner | Partial character-creation patch (sparse)                                              |
| PATCH  | `/mechanics`          | owner/co-owner | Partial mechanics patch (sparse; server sets `editionPreset.modified` and `appliedAt`) |

`mechanics` stores edition preset selection, armor class knobs, and attack resolution mode. Defaults resolve to the **5e** preset when nothing is stored.

Id conflicts use `assertVocabularyIdAvailable` (409) — campaign ids must not shadow system seed ids.
