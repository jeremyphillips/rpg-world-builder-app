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

| Entry                  | URL                                                | channel | kind | rulesScope | ownership |
| ---------------------- | -------------------------------------------------- | ------- | ---- | ---------- | --------- |
| Sidebar PC build       | `/characters/new`                                  | build   | pc   | ruleset    | user      |
| Sidebar PC import      | `/characters/import`                               | import  | pc   | ruleset    | user      |
| NPC build              | `/campaigns/:id/npcs/new`                          | build   | npc  | campaign   | campaign  |
| NPC import             | `/campaigns/:id/npcs/import`                       | import  | npc  | campaign   | campaign  |
| Campaign PC onboarding | `/campaigns/:id/onboarding`                        | build   | pc   | campaign   | user      |
| Quick NPC (org member) | organization detail → Add member drawer → modal    | build   | npc  | campaign   | campaign  |
| Quick NPC (standalone) | location People drawer → Character segment → modal | build   | npc  | campaign   | campaign  |
| PC detail              | `/characters/:characterId`                         | —       | pc   | —          | user      |
| Campaign PC detail     | `/campaigns/:campaignId/characters/:characterId`   | —       | pc   | —          | user      |
| NPC detail             | `/campaigns/:id/npcs/:npcId`                       | —       | npc  | —          | campaign  |

NPC authoring routes require campaign `owner` or `co-owner` (see campaign feature
README). Default `/characters/*` never carries campaign id in the URL.

### Quick NPC (organization member)

Campaign managers create an NPC and stamp organization membership in one flow from the
organization detail **Members** section — no full builder route.

| Layer                                               | Responsibility                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Organizations hook (`useOrganizationMembersDetail`) | Overlay modes only: `add` \| `createNpc` \| edit/remove \| `null`; context pass-through; cancel/success reactions         |
| `OrganizationMemberPickerDrawer`                    | Relationship picker; `auxiliaryAction` **Create new NPC** delegates to parent (no `bodyReplacement`)                      |
| `QuickNpcCreateModal` (character feature)           | Setup (title → species → build card) → TabbedForm authoring (Details / Requirements); `usePendingAwareOpenChange`; create |

**Dismiss paths:** Cancel / X / Escape during authoring → `createNpc` → `add` (drawer stays
open with preserved search). Success → `null` (all overlays close). Pending submit blocks dismiss.

**Setup phase** (`useCreateSetupSequence` + `CreateSetupPanel` for Title and Species;
`QuickNpcBuildCard` for Class and Level — reads `isEditingUpstream` from the shared model):

- **Title-first progressive reveal** — only the membership title choice is visible until the user
  selects a title or explicit **No title** (`membershipTitle: undefined` is setup-only unset and
  incomplete; deliberate no-title uses the UI sentinel `ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE`
  / `__no_title__`, which is not persisted on the created NPC).
- **Build card** — after Title and Species are complete and `isEditingUpstream` is false,
  one sibling card owns Class and Level. Build is registered as an **explicit external decision**
  (`quickNpcBuild`) — footer **Continue** confirms Build at its current revision before transitioning
  to authoring. Reopening Title or Species or changing Level/Class changes the revision, invalidating
  any prior confirmation until the user confirms again. Same-value reselect dismisses without clearing Build.
  When the selected title carries a snapshotted `npcRecommendation`, the card shows **Recommended
  build** identity (template label + description) plus in-row Class and Level editors. Without a
  title recommendation (including **No title**), the card shows **Build** with Class and Level only
  — default campaign level is not labeled as a recommendation.
- **Level** — reseeded from the title recommendation (clamped to campaign constraints) on Title
  change; user-owned across Species changes. Level 0 clears class and omits the Class row.
- **Class** — ranked from merged template + organization class affinities inside the build card;
  when exactly one eligible recommendation exists after Species is complete, `classId` is
  auto-seeded and collapses like a manual selection. Cardinality and eligibility logic live in
  `applyQuickNpcSetupValueChange`, not in the card.

Setup mutations flow through `applyQuickNpcSetupValueChange` inside functional `setState` (location
create convention). Title change preserves Species but reseeds Build, Level, and Class. Setup events
use the shared `onSetupValueChange({ setId, previousValue, nextValue, invalidatedSetIds })`
contract from `@/lib/create-setup`. Setup footer states derive from `CreateSetupFooter` — Cancel-only
while choices auto-complete, disabled/enabled Continue while Build resolves, re-entry Continue when
returning from authoring without material changes.

**Create path:** `buildQuickNpcCreateInput()` runs `resolveAutomaticNpcBuild()` (optional
`requiredWeaponIds` / `requiredSpellIds` hard constraints), injects `connections.organizations`, then
`finalizeNpcCharacterBuild()` — one `POST /api/campaigns/:id/npcs` with membership included. No
template id is persisted on the created NPC.

**Requirements tab:** multi-add combobox pickers compose canonical equipment/spell compact row VMs
and equipment `not_proficient` callouts only (`visibleStatuses: ['not_proficient']` on the shared
callout stack). Discovery lists individually reachable options; resolver authority decides joint
satisfiability. Setup changes atomically intersect stale requirement ids with the reachable set.
Name generation is independent of mechanical build determinism.
Overlay policy: [drawer-shell.md](./drawer-shell.md#overlay-modality-policy). Resolver detail:
[automatic-build-resolution.md](../../../packages/contracts/docs/character-builder/automatic-build-resolution.md).

### Quick NPC (standalone)

Campaign managers create an NPC without organization membership from the location detail **People &
organizations** drawer when the Character subject segment is active.

| Layer                                       | Responsibility                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useLocationConnectedPartiesDetail`         | Loads NPC build context readiness (`useCampaignNpcBuildContext`); passes `quickNpc` to the People drawer                                                |
| `LocationInversePeopleConnectionLinkDrawer` | Character segment resolves `resolveRelationshipPickerCharacterCreateIntents`; build-context readiness gates the auxiliary action at the drawer boundary |
| `useRelationshipPickerNestedCreate`         | Launches standalone `QuickNpcCreateModal`; `onCreated({ contentType: 'npcs', id })` selects the NPC locally — drawer stays open                         |
| `QuickNpcCreateModal`                       | `context: { kind: 'standalone' }`; setup is Species → Build only; no membership stamp on create                                                         |

**Persist split:** nested Create NPC posts only `POST /npcs` with empty org/location connections.
Footer **Add** persists the location edge via `onCharacterSubmit` — the same boundary as organization
nested create.

**Level 0:** when campaign minimum is 0, standalone Build opens as Level 0 / Class not applicable and
is confirmable — expected product behavior, not a seeder bug.

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
