# campaign (dashboard feature)

Campaigns the user owns or co-runs: create and manage campaigns, configure
ruleset patches, track sessions, and (for DMs) author campaign-owned NPCs.

## Routes

| Path                                 | Screen                      |
| ------------------------------------ | --------------------------- |
| `/campaigns/new`                     | Create campaign             |
| `/campaigns/:campaignId`             | Campaign overview           |
| `/campaigns/:campaignId/sessions`    | Sessions                    |
| `/campaigns/:campaignId/settings`    | Settings and ruleset patch  |
| `/campaigns/:campaignId/npcs`        | NPC roster (owner/co-owner) |
| `/campaigns/:campaignId/npcs/new`    | NPC builder                 |
| `/campaigns/:campaignId/npcs/import` | NPC import (experimental)   |
| `/campaigns/:campaignId/npcs/:npcId` | NPC detail                  |

Player-owned PCs live under `/characters/*`, not under the campaign shell. See
[character-acquisition.md](../../../docs/character-acquisition.md) for the
acquisition model (axes, ownership, build/import finalization).

## NPC authoring

- **Who:** `owner` and `co-owner` only (`useCanManageCampaign`, API
  `requireRole(['owner', 'co-owner'])`).
- **Where:** Routes under `/campaigns/:campaignId/npcs/*`; `campaignId` comes
  from the URL, not client body fields.
- **How:** Build (`CharacterBuilderShell` with campaign build context) or import
  (`CharacterImportForm` + `finalizeNpcCharacterImport`).
- **Ownership:** NPCs are campaign-owned (`characterType: 'npc'`, required
  `campaignId`, no `userId`). Distinct from user-owned PCs — see
  [ROLES.md](../../../../packages/contracts/ROLES.md#character-ownership).

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
