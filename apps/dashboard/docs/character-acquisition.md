# Character acquisition

High-level model for how characters enter the system (build or import) and how
campaign scope relates to ownership. Covers contracts, API boundaries, and
dashboard entry surfaces through NPC import (phase 6).

## Axes

| Axis              | Values                | Notes                                                                       |
| ----------------- | --------------------- | --------------------------------------------------------------------------- |
| `channel`         | `build`, `import`     | Initial acquisition path; import may later enter builder steps              |
| `characterKind`   | `pc`, `npc`           | What is being authored                                                      |
| `surface`         | `dashboard`, `public` | Where UI is hosted                                                          |
| `rulesScope`      | `ruleset`, `campaign` | Which rules/catalog apply                                                   |
| `ownershipTarget` | **derived**           | `user` for PC; `campaign` for NPC — use `resolveCharacterOwnershipTarget()` |

**Rules scope ≠ campaign membership.** Campaign rules during PC build/import do
not set `Character.campaignId`. PC campaign association goes through
`CampaignCharacterParticipation` and `controlledCharacterIds` on membership —
including invite onboarding completion via `assignControlledPcToCampaignMember`.

## `CharacterBuildAcquisition`

Builder finalization branches on `context.acquisition.kind`:

| Kind              | When used                              | Finalize path                            |
| ----------------- | -------------------------------------- | ---------------------------------------- |
| `standalone`      | Sidebar PC build/import                | `POST /api/characters`                   |
| `campaign_npc`    | Campaign NPC build/import              | `POST /api/campaigns/:id/npcs`           |
| `campaign_invite` | Invite onboarding new-character branch | `completeCampaignInviteWithNewCharacter` |

The acquisition discriminator prevents inferring the wrong mutation path from
`characterKind` alone.

## Contracts layout

```
packages/contracts/src/rpg/runtime/character-acquisition/  # shared axes only
packages/contracts/src/rpg/runtime/character-builder/      # build context + engine
packages/contracts/src/character-import/                   # adapt + finalize import
```

## Dashboard entry surfaces

| Entry              | URL                                              | channel | kind | rulesScope | ownership |
| ------------------ | ------------------------------------------------ | ------- | ---- | ---------- | --------- |
| Sidebar PC build   | `/characters/new`                                | build   | pc   | ruleset    | user      |
| Sidebar PC import  | `/characters/import`                             | import  | pc   | ruleset    | user      |
| NPC build          | `/campaigns/:id/npcs/new`                        | build   | npc  | campaign   | campaign  |
| NPC import         | `/campaigns/:id/npcs/import`                     | import  | npc  | campaign   | campaign  |
| Invite onboarding  | `/campaigns/:id/onboarding?inviteId=…`           | build   | pc   | campaign   | user      |
| PC detail          | `/characters/:characterId`                       | —       | pc   | —          | user      |
| Campaign PC detail | `/campaigns/:campaignId/characters/:characterId` | —       | pc   | —          | user      |
| NPC detail         | `/campaigns/:id/npcs/:npcId`                     | —       | npc  | —          | campaign  |

NPC authoring routes require campaign `owner` or `co-owner` (see campaign feature
README). Default `/characters/*` never carries campaign id in the URL.

### Campaign-scoped PC detail

`/campaigns/:campaignId/characters/:characterId` is a thin campaign-context
wrapper around the shared `CharacterDetailContent` sheet. It adds a campaign
breadcrumb and reuses the standalone PC detail view model — no duplicate sheet
layout. See `campaign-character-detail.tsx`.

## API boundaries

| Endpoint                                                  | Purpose                      |
| --------------------------------------------------------- | ---------------------------- |
| `POST /api/characters`                                    | User-owned PC create         |
| `GET/DELETE /api/characters/:id`                          | PC read/delete               |
| `GET/POST /api/campaigns/:campaignId/npcs`                | Campaign NPC list/create     |
| `GET/PATCH/DELETE /api/campaigns/:campaignId/npcs/:npcId` | NPC read/status patch/delete |

NPC create body: `CreateNpcRequestInput` — no client `campaignId`, `characterType`, or
`vital` (route/service assigns defaults and creates open participation). NPC status
PATCH accepts `campaignNpcStatusPatchSchema` (optional `vital` and/or `roster` patches).
PC vital PATCH is deferred — see
[character-vital-and-campaign-participation.md](./character-vital-and-campaign-participation.md).

## Build finalization

| Function                      | Purpose                                                           |
| ----------------------------- | ----------------------------------------------------------------- |
| `finalizeCharacterBuild()`    | Builder draft → `CreateCharacterInput` (PC)                       |
| `finalizeNpcCharacterBuild()` | Builder draft → `CreateNpcRequestInput` (strips ownership fields) |

## Import finalization

| Function                       | Purpose                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `finalizeCharacterImport()`    | `CharacterImportResult` → `CreateCharacterInput`                 |
| `finalizeNpcCharacterImport()` | Thin wrapper → `CreateNpcRequestInput` (strips ownership fields) |

Shared assembly lives in `assembleImportCreateCharacterInput()`. Adaptation stays in
`adaptDndBeyondCharacter()` — finalizers only map extracted preview fields.

## Detail sheet (shared PC/NPC UI)

PC and NPC detail routes both build a `CharacterDetailViewModel` and render
[`CharacterDetailContent`](../src/features/character/components/detail/character-detail-content.client.tsx).
Keep sheet layout kind-neutral there; route wrappers own kind-specific loading and
mutations. See the growth comment on `CharacterDetailContent` for the PC/NPC
boundary (hide user-ownership affordances on NPC surfaces).
