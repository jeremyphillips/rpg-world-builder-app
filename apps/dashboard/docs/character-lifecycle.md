# Character lifecycle

Shared roster and vital state for player characters and campaign NPCs. Lifecycle is
**current-state only** — event history, narrative effective dates, and archival
suppression are deferred.

## Model boundary

| Concept                   | Persisted | Notes                                  |
| ------------------------- | --------- | -------------------------------------- |
| `lifecycle.roster.status` | Yes       | `active`, `inactive`, `retired`        |
| `lifecycle.vital.status`  | Yes       | `alive`, `deceased`, `unknown`         |
| Per-dimension `note`      | Yes       | Authorable in the NPC lifecycle editor |
| Per-dimension `changedAt` | Yes       | API-assigned when status changes       |
| `origin`                  | No        | Document inline only                   |
| Visibility / archive      | No        | Deferred                               |

NPC lifecycle is **instance state** on the character sheet. It is not content
draft/publish, source, or campaign availability.

## Defaults

New PCs and NPCs receive `active` roster + `alive` vital via
`createDefaultCharacterLifecycle()` on create. Legacy documents without a lifecycle
subdocument normalize to the same defaults on read.

## API

| Route                                          | Lifecycle PATCH                            |
| ---------------------------------------------- | ------------------------------------------ |
| `PATCH /api/campaigns/:campaignId/npcs/:npcId` | Yes — campaign owner/co-owner              |
| `PATCH /api/characters/:id`                    | **Deferred** — PC edit ownership undefined |

Patch body: `characterLifecyclePatchSchema` (status + note per dimension). The API
assigns `changedAt` when a dimension's status changes and preserves it for note-only
updates or no-op status re-submissions.

## Dashboard surfaces

### NPC overview

- Roster and Vital badge columns with shared presentation resolvers.
- Advanced filters default to **All** — retired and deceased NPCs remain visible until
  a filter is applied.
- Bulk edit: roster status only (no note, no vital). Selection cap: 50 rows.

### NPC detail

- Read-only `CharacterIdentityLifecycleSummary` below XP.
- `NpcLifecycleEditor` dialog (owner/co-owner) for status + notes.

### PC detail

- Summary only — no edit action until ownership rules are defined.

## Contracts

- Schemas: `packages/contracts/src/rpg/runtime/character/lifecycle.ts`
- Patch helpers: `update-character-lifecycle.ts` (`mergeCharacterLifecyclePatch` for
  previews; `applyLifecycleTransitionMetadata` for API mutation policy)
- Bulk roster: `character-bulk-lifecycle.ts` using neutral `BulkFieldOperation<T>`
