# Character vital and campaign participation

Shared status dimensions for player characters and campaign NPCs. **Vital** is
intrinsic to the character; **roster** is campaign-relative on participation.
Both are **current-state only** — event history, narrative effective dates, and
archival suppression are deferred.

## Model boundary

| Concept                   | Persisted on                                   | Values                              |
| ------------------------- | ---------------------------------------------- | ----------------------------------- |
| Vital status              | `Character.vital.status`                       | `alive`, `deceased`, `unknown`      |
| Roster status             | `CampaignCharacterParticipation.roster.status` | `active`, `inactive`, `retired`     |
| Per-dimension `note`      | Same subdocument as the status                 | Authorable in the NPC status editor |
| Per-dimension `changedAt` | Same subdocument                               | API-assigned when status changes    |
| `origin`                  | No                                             | Document inline only                |
| Visibility / archive      | No                                             | Deferred                            |

NPC and PC vital state is **instance state** on the character sheet. Roster is
**campaign context** on `CampaignCharacterParticipation`. Neither is content
draft/publish, source, or campaign availability.

## Defaults

New characters receive `alive` vital via `createDefaultCharacterVitalState()` on
create. New participations receive `active` roster via
`createDefaultCampaignRosterState()`. Legacy documents without these subdocuments
normalize to the same defaults on read.

## API

| Route                                          | Vital PATCH  | Roster PATCH                      |
| ---------------------------------------------- | ------------ | --------------------------------- |
| `PATCH /api/campaigns/:campaignId/npcs/:npcId` | Yes          | Yes — campaign owner/co-owner     |
| `PATCH /api/characters/:id`                    | **Deferred** | N/A — PC edit ownership undefined |

NPC patch body: `campaignNpcStatusPatchSchema` — optional `vital` and/or `roster`
patches (`characterVitalPatchSchema`, `campaignRosterPatchSchema`). The API
assigns `changedAt` when a dimension's status changes and preserves it for
note-only updates or no-op status re-submissions.

NPC list/detail DTOs pair `character` (includes `vital`) with `participation`
(includes `roster`). Campaign NPC routes require an open participation for the
character in that campaign.

## Dashboard surfaces

### NPC overview

- Roster and Vital badge columns with shared presentation resolvers.
- Advanced filters default to **All** — retired and deceased NPCs remain visible until
  a filter is applied.
- Bulk edit: roster status only (no note, no vital). Selection cap: 50 rows.

### NPC detail

- Read-only `CampaignCharacterStatusSummary` below XP (vital + roster).
- `NpcStatusEditor` dialog (owner/co-owner) for status + notes.

### PC detail

- `CharacterVitalSummary` only — no edit action until ownership rules are defined.
- Campaign roster for PCs will surface from participation when PC campaign
  workflows land.

## Contracts

- Vital: `packages/contracts/src/rpg/runtime/character/character-vital.ts`
- Roster: `packages/contracts/src/rpg/campaign/character-roster-state.ts`
- Participation: `packages/contracts/src/rpg/campaign/campaign-character-participation.ts`
- Patch helpers: `update-character-vital.ts`, `update-campaign-roster.ts`
- Bulk roster: `character-bulk-roster.ts` using neutral `BulkFieldOperation<T>`
