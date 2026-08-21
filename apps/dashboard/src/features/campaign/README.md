# campaign (dashboard feature)

Campaigns the user owns or co-runs: create and manage campaigns, configure
ruleset patches, track sessions, and (for DMs) author campaign-owned NPCs.

## Key files

| Area                     | Path                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Public barrel            | `index.ts`                                                                                                          |
| Shell chrome             | `components/campaign-picker.tsx`, `campaign-switcher.tsx`, `campaign-display-name.tsx`, `campaign-topbar-title.tsx` |
| Create wizard            | `components/create/`, `routes/campaign-create.tsx`, `lib/settings/`                                                 |
| Campaign overview        | `components/overview/`, `routes/campaign-detail.tsx`                                                                |
| Player onboarding        | `components/onboarding/`, `routes/campaign-onboarding.tsx`, `lib/onboarding/`                                       |
| Recovery / invites index | `components/recovery/`, `lib/recovery/`                                                                             |
| Roster shell             | `routes/campaign-characters-overview.tsx`, `lib/characters/`                                                        |
| Settings / rules forms   | `lib/settings/`, `lib/rules/`                                                                                       |
| Campaign identity VM     | `lib/campaign-display.ts`                                                                                           |
| Selection / topbar state | `lib/navigation/`                                                                                                   |
| Invite form schemas      | `lib/forms/invite-*-form-fields.ts`                                                                                 |

## Routes

| Path                                 | Screen                                        |
| ------------------------------------ | --------------------------------------------- |
| `/campaigns/new`                     | Create campaign                               |
| `/campaigns/:campaignId`             | Campaign overview                             |
| `/campaigns/:campaignId/sessions`    | Sessions                                      |
| `/campaigns/:campaignId/settings`    | Settings and ruleset patch                    |
| `/campaigns/:campaignId/characters`  | Participation roster (campaign feature)       |
| `/campaigns/:campaignId/npcs`        | NPC roster (owner/co-owner; `character/npc/`) |
| `/campaigns/:campaignId/npcs/new`    | NPC builder                                   |
| `/campaigns/:campaignId/npcs/import` | NPC import (experimental)                     |
| `/campaigns/:campaignId/npcs/:npcId` | NPC detail                                    |
| `/campaigns/:campaignId/onboarding`  | Player character onboarding                   |

Player-owned PCs live under `/characters/*`, not under the campaign shell.
Incomplete PC members reach onboarding from the public invite accept redirect or
the in-campaign recovery CTA. See
[character-acquisition.md](../../../docs/character-acquisition.md) for the
acquisition model (axes, ownership, build/import finalization).

## Invite ownership

| Concern                                | Location                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Manager send-invite dialog             | `components/overview/invite-member-dialog.client.tsx`                                                     |
| Overview invite list / row actions     | `components/overview/campaign-overview-invitations-section.tsx`, `campaign-invite-row-actions.client.tsx` |
| Pending invite promotions (home/index) | `components/recovery/pending-campaign-invitation*.tsx`                                                    |
| Invite review card                     | `features/campaign-invite/`                                                                               |
| Form schemas (dialog + create wizard)  | `lib/forms/invite-member-form-fields.ts`, `invite-members-form-fields.ts`                                 |

## Player onboarding

- **Who:** `pc` members whose `viewerState` is recoverable (`onboarding_incomplete`,
  `control_stale`, or `participation_missing`) — see list API `viewerState` projection.
- **Where:** `/campaigns/:campaignId/onboarding` — choice between existing
  character or new builder; reconnect uses `/onboarding?mode=reconnect&characterId=…`.
- **How:** Membership-scoped API (`/api/campaigns/:id/onboarding-*`) gated by
  `loadCampaignOnboardingGate`. Invite accept stores `sourceInviteId` on membership;
  completion marks the linked invite when possible (audit-only after membership is established).
- **Recovery:** Membership survives invite expiry; players can return to
  onboarding without an `inviteId` query param. Recovery prompts are split by
  surface — layout alert (in-campaign), home promotion cards (`PromotionCard`),
  and campaigns index rows (`CampaignDestinationRow`). See
  [availability.md](../../../docs/availability.md#onboarding-recovery-surfaces).
- **Invite handoff:** Public accept and dashboard/public **Continue setup** navigate
  to plain onboarding — not `resolveCampaignRecoveryDestination`. Accept and continue
  both persist campaign selection first.

## Component map (onboarding recovery)

| Component                            | Location                                                                  | Surface                                                     |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `PromotionCard`                      | `components/layout/promotion-card.tsx`                                    | Shared home promotion chrome                                |
| `CampaignRecoveryState`              | `lib/recovery/campaign-recovery-state.ts`                                 | Dashboard wrapper over `viewerState`                        |
| `resolveCampaignEntryDestination`    | `lib/recovery/campaign-destination.lib.ts`                                | Index/switcher/continue → campaign shell                    |
| `resolveCampaignRecoveryDestination` | `lib/recovery/campaign-destination.lib.ts`                                | Home/alert/nav CTA → onboarding or reconnect                |
| `resolveCampaignRecoveryPromotions`  | `lib/recovery/campaign-recovery-promotions.lib.ts`                        | Home promotion ranking (preference ranks, never suppresses) |
| `CampaignRecoveryPromotionCard`      | `components/recovery/campaign-recovery-promotion-card.client.tsx`         | Home recovery promotion                                     |
| `CampaignInvitationCard`             | `features/campaign-invite/components/campaign-invitation-card.client.tsx` | Home pending invite promotion                               |
| `CampaignLayoutRecoveryChrome`       | `components/recovery/campaign-layout-recovery-chrome.client.tsx`          | Layout loading/error/recovery shell                         |
| `CampaignOnboardingIncompleteAlert`  | `components/recovery/campaign-onboarding-incomplete-alert.client.tsx`     | Campaign layout warning                                     |
| `CampaignDestinationRow`             | `components/recovery/campaign-destination-row.client.tsx`                 | Campaigns index rows                                        |
| `persistCampaignSelectionBestEffort` | `@rpg/api-client`                                                         | Public accept/continue handoff (local + server)             |
| `usePersistCampaignSelection`        | `features/campaign`                                                       | Dashboard accept/continue handoff                           |

## Campaign template pipeline

- `GET /api/campaigns/templates` exposes the shipped, validated templates.
- `listCampaignTemplates()` and `useCampaignTemplates()` feed the creation
  chooser. Selecting a template remounts the wizard with its editable defaults;
  switching back to blank clears those defaults.
- `POST /api/campaigns` accepts optional `campaignTemplateId`; the API resolves
  defaults before persistence, with explicit request values taking precedence.
- The campaign snapshots the selected template id/version in
  `presetProvenance`. This is informational: later catalog releases never
  mutate an existing campaign.
- Template discovery failure does not block blank campaign creation.

## NPC authoring

- **Who:** `owner` and `co-owner` only (`useCanManageCampaign`, API
  `requireRole(['owner', 'co-owner'])`).
- **Where:** Routes under `/campaigns/:campaignId/npcs/*` (implemented in
  `character/npc/`); `campaignId` comes from the URL, not client body fields.
- **How:** Build (`CharacterBuilderShell` with campaign build context) or import
  (`CharacterImportForm` + `finalizeNpcCharacterImport`).
- **Ownership:** NPCs are campaign-owned (`characterType: 'npc'`, required
  `campaignId`, no `userId`). Distinct from user-owned PCs — see
  [ROLES.md](../../../../packages/contracts/ROLES.md#character-ownership).

## Related docs

- [feature-structure.md](../../../docs/feature-structure.md) — folder layout
- [feature-conventions.md](../../../docs/feature-conventions.md) — boundary rule
- [availability.md](../../../docs/availability.md) — onboarding recovery surfaces
- [character-acquisition.md](../../../docs/character-acquisition.md) — PC vs NPC ownership
