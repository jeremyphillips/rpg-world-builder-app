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
including membership-scoped onboarding completion via
`assignControlledPcToCampaignMember`. Invite rows are an audit trail after accept;
membership is the source of truth for recoverable onboarding.

## `CharacterBuildAcquisition`

Builder finalization branches on `context.acquisition.kind`:

| Kind                     | When used                                      | Finalize path                                 |
| ------------------------ | ---------------------------------------------- | --------------------------------------------- |
| `standalone`             | Sidebar PC build/import                        | `POST /api/characters`                        |
| `campaign_npc`           | Campaign NPC build/import                      | `POST /api/campaigns/:id/npcs`                |
| `campaign_pc_onboarding` | Campaign membership onboarding (new character) | `POST /api/campaigns/:id/onboarding/complete` |

The dashboard onboarding flow uses `campaign_pc_onboarding` exclusively for campaign
PC builder finalization. Do not infer finalize routing from `characterKind` alone.

## Contracts layout

```
packages/contracts/src/rpg/runtime/character-acquisition/  # shared axes only
packages/contracts/src/rpg/runtime/character-builder/      # build context + engine
packages/contracts/src/character-import/                   # adapt + finalize import
```

## Dashboard entry surfaces

| Entry                  | URL                                              | channel | kind | rulesScope | ownership |
| ---------------------- | ------------------------------------------------ | ------- | ---- | ---------- | --------- |
| Sidebar PC build       | `/characters/new`                                | build   | pc   | ruleset    | user      |
| Sidebar PC import      | `/characters/import`                             | import  | pc   | ruleset    | user      |
| NPC build              | `/campaigns/:id/npcs/new`                        | build   | npc  | campaign   | campaign  |
| NPC import             | `/campaigns/:id/npcs/import`                     | import  | npc  | campaign   | campaign  |
| Campaign PC onboarding | `/campaigns/:id/onboarding`                      | build   | pc   | campaign   | user      |
| Quick NPC (org member) | organization detail → Add member drawer → modal  | build   | npc  | campaign   | campaign  |
| PC detail              | `/characters/:characterId`                       | —       | pc   | —          | user      |
| Campaign PC detail     | `/campaigns/:campaignId/characters/:characterId` | —       | pc   | —          | user      |
| NPC detail             | `/campaigns/:id/npcs/:npcId`                     | —       | npc  | —          | campaign  |

NPC authoring routes require campaign `owner` or `co-owner` (see campaign feature
README). Default `/characters/*` never carries campaign id in the URL.

### Quick NPC (organization member)

Campaign managers create an NPC and stamp organization membership in one flow from the
organization detail **Members** section — no full builder route.

| Layer                                               | Responsibility                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Organizations hook (`useOrganizationMembersDetail`) | Overlay modes only: `add` \| `createNpc` \| edit/remove \| `null`; context pass-through; cancel/success reactions |
| `OrganizationMemberPickerDrawer`                    | Relationship picker; footer **Create new NPC** delegates to parent (no `bodyReplacement`)                         |
| `QuickNpcCreateModal` (character feature)           | Setup (species/class/level) → TabbedForm authoring (Details / Requirements); `usePendingAwareOpenChange`; create  |

**Dismiss paths:** Cancel / X / Escape during authoring → `createNpc` → `add` (drawer stays
open with preserved search). Success → `null` (all overlays close). Pending submit blocks dismiss.

**Create path:** `buildQuickNpcCreateInput()` runs `resolveAutomaticNpcBuild()` (optional
weapon/spell constraints), injects `connections.organizations`, then
`finalizeNpcCharacterBuild()` — one `POST /api/campaigns/:id/npcs` with membership included.
Overlay policy: [drawer-shell.md](./drawer-shell.md#overlay-modality-policy). Resolver detail:
[automatic-build-resolution.md](../../../packages/contracts/docs/character-builder/automatic-build-resolution.md).

### Campaign-scoped PC detail

`/campaigns/:campaignId/characters/:characterId` is a thin campaign-context
wrapper around the shared `CharacterDetailContent` sheet. It adds a campaign
breadcrumb and reuses the standalone PC detail view model — no duplicate sheet
layout. See `campaign-character-detail.tsx`.

Public invite accept redirects to this route. The dashboard does **not** pass
`inviteId` in the URL; the API links accepted invites from membership during
completion. See [campaign-invites.md](../../../api/docs/campaign-invites.md).

## API boundaries

| Endpoint                                                        | Purpose                              |
| --------------------------------------------------------------- | ------------------------------------ |
| `POST /api/characters`                                          | User-owned PC create                 |
| `GET/DELETE /api/characters/:id`                                | PC read/delete                       |
| `GET /api/campaigns/:campaignId/onboarding-context`             | Membership-scoped onboarding context |
| `GET /api/campaigns/:campaignId/onboarding/eligible-characters` | Eligible PCs for onboarding          |
| `POST /api/campaigns/:campaignId/onboarding/complete`           | Complete onboarding (existing/new)   |
| `GET/POST /api/campaigns/:campaignId/npcs`                      | Campaign NPC list/create             |
| `GET/PATCH/DELETE /api/campaigns/:campaignId/npcs/:npcId`       | NPC read/status patch/delete         |

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

Quick NPC skips the step-by-step builder: `resolveAutomaticNpcBuild()` completes
a draft from a compact seed, the flow injects the organization membership into
`connections.organizations`, and the same `finalizeNpcCharacterBuild()` performs
the single authoritative `finalSubmit` validation. One `POST /api/campaigns/:id/npcs`
creates the NPC with its membership — no follow-up mutation. Domain detail:
[automatic-build-resolution.md](../../../packages/contracts/docs/character-builder/automatic-build-resolution.md).

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
