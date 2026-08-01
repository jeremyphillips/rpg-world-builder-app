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
| `/campaigns/:campaignId/onboarding`  | Player character onboarding |

Player-owned PCs live under `/characters/*`, not under the campaign shell.
Incomplete PC members reach onboarding from the public invite accept redirect or
the in-campaign recovery CTA. See
[character-acquisition.md](../../../docs/character-acquisition.md) for the
acquisition model (axes, ownership, build/import finalization).

## Player onboarding

- **Who:** `pc` members with `controlledCharacterIds.length === 0`
  (`onboarding_incomplete` participation state).
- **Where:** `/campaigns/:campaignId/onboarding` — choice between existing
  character or new builder.
- **How:** Membership-scoped API (`/api/campaigns/:id/onboarding-*`). Invite
  accept stores `sourceInviteId` on membership; completion marks the linked
  invite when possible (audit-only after membership is established).
- **Recovery:** Membership survives invite expiry; players can return to
  onboarding without an `inviteId` query param. Recovery prompts are split by
  surface — layout alert (in-campaign), home promotion cards (`PromotionCard`),
  and campaigns index rows (`CampaignDestinationRow`). See
  [availability.md](../../../docs/availability.md#onboarding-recovery-surfaces).

## Component map (onboarding recovery)

| Component                            | Location                                                                  | Surface                                                     |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `PromotionCard`                      | `components/layout/promotion-card.tsx`                                    | Shared home promotion chrome                                |
| `CampaignRecoveryState`              | `lib/campaign-recovery-state.ts`                                          | Dashboard wrapper over `campaign.viewerState`               |
| `resolveCampaignEntryDestination`    | `lib/campaign-destination.lib.ts`                                         | Index/switcher/continue → campaign shell                    |
| `resolveCampaignRecoveryDestination` | `lib/campaign-destination.lib.ts`                                         | Home/alert CTA → onboarding or reconnect                    |
| `resolveCampaignRecoveryPromotions`  | `lib/campaign-recovery-promotions.lib.ts`                                 | Home promotion ranking (preference ranks, never suppresses) |
| `CampaignRecoveryPromotionCard`      | `components/campaign-recovery-promotion-card.client.tsx`                  | Home recovery promotion                                     |
| `CampaignInvitationCard`             | `features/campaign-invite/components/campaign-invitation-card.client.tsx` | Home pending invite promotion                               |
| `CampaignLayoutRecoveryChrome`       | `components/campaign-layout-recovery-chrome.client.tsx`                   | Layout loading/error/recovery shell                         |
| `CampaignOnboardingIncompleteAlert`  | `components/campaign-onboarding-incomplete-alert.client.tsx`              | Campaign layout warning                                     |
| `CampaignDestinationRow`             | `components/campaign-destination-row.client.tsx`                          | Campaigns index rows                                        |
| `persistCampaignSelectionBestEffort` | `@rpg/api-client`                                                         | Accept handoff (local + server)                             |

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
- **Where:** Routes under `/campaigns/:campaignId/npcs/*`; `campaignId` comes
  from the URL, not client body fields.
- **How:** Build (`CharacterBuilderShell` with campaign build context) or import
  (`CharacterImportForm` + `finalizeNpcCharacterImport`).
- **Ownership:** NPCs are campaign-owned (`characterType: 'npc'`, required
  `campaignId`, no `userId`). Distinct from user-owned PCs — see
  [ROLES.md](../../../../packages/contracts/ROLES.md#character-ownership).

Folder layout and the feature-boundary rule are documented in
[feature-conventions](../../../docs/feature-conventions.md).
