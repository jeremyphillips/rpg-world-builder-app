# Campaign availability (reasons + UI)

UI-derived campaign availability for content authoring and read-only surfaces.
Nothing here is persisted — reasons are computed from resolved campaign rules,
form toggle state, and feature-specific producers.

Generic status chrome lives in `@rpg/ui` (`Alert`, status tokens). Dashboard
shared lib: [`apps/dashboard/src/lib/availability/`](../src/lib/availability/).

## Model

```ts
type AvailabilityReason = { code: AvailabilityReasonCode; settingId?: CampaignSettingId }
type Availability = { status: 'active' | 'inactive'; reasons?: AvailabilityReason[] }
```

- **`resolveAvailability(reasons)`** — empty reasons → `{ status: 'active' }`.
- **`combineAvailabilityReasons(activeByCampaignToggle, extraReasons?)`** — merges
  optional extra reasons from feature producers. (Legacy per-row **Active in
  campaign** toggles were removed; persisted campaign access lives on
  `campaignAccess` — see content README.)
- **`resolveAvailabilityBadge(availability)`** — rail-card `Inactive` badge data
  (`MasterDetailListBadge`-compatible).
- **`resolveAvailabilityAlertVariant(availability)`** — maps primary reason
  severity to `@rpg/ui` `Alert` variant.

### Severity and badge precedence

When multiple reasons apply, the **highest severity** wins for badge label and
alert variant: `destructive` > `warning` > `info`. Ties break on
`AVAILABILITY_REASON_CODES` registry order.

## Registries

### Member onboarding (campaign overview)

Campaign overview derives PC onboarding state from membership — **not** a persisted
field:

- `onboarding_incomplete` — `pc` role with empty `controlledCharacterIds`
  (accepted invite, character not yet assigned)
- `character_added` — `pc` role with at least one controlled character

See `apps/api/docs/campaign-invites.md` and `campaign-overview.service.ts`.

### Viewer state (campaign list / switcher)

`GET /api/campaigns` includes `viewerState` and optional `recoveryReason` on each
`CampaignListItem` — an actionable server projection for the **current viewer**:

- `ready` — staff/observer or PC with open controlled character(s)
- `onboarding_incomplete` — PC with no control and no viewer-relevant open participation
- `control_stale` / `participation_missing` — repairable connection gaps (reconnect via onboarding)
- `membership_invalid` — unsupported role; alert-only (no recovery CTA)

List API scopes open participations to controlled ∪ user-owned characters so fresh invites
into populated campaigns are not misclassified. Dashboard navigation splits **entry**
(`resolveCampaignEntryDestination` → campaign shell) from **recovery**
(`resolveCampaignRecoveryDestination` → onboarding / reconnect). See
[Character sheet routing](./character-sheet-routing.md).

### Pending invitations (dashboard cards)

`GET /api/campaign-invites/mine` feeds pending invitation cards on dashboard home
and the campaigns index. Cards link to `/app/campaign-invites/:inviteId` via
`dashboardCampaignInviteReviewPath`. Invites for campaigns the user already belongs
to are excluded server-side and again client-side before render.

### Onboarding recovery surfaces

| Surface         | Component                                                            | Role                                                                                                                       |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Campaign layout | `CampaignLayoutRecoveryChrome` + `CampaignOnboardingIncompleteAlert` | Persistent recovery inside `/campaigns/:id/*` (hidden on `/onboarding`); loading/error chrome when campaign row unresolved |
| Dashboard home  | `CampaignRecoveryPromotionCard`, `CampaignInvitationCard`            | Highest-priority recovery promotion + pending invites                                                                      |
| Campaigns index | `CampaignDestinationRow`                                             | Every campaign status row                                                                                                  |

Recovery derives from `campaign.viewerState` via `resolveCampaignRecoveryState`
(`ready` | `onboarding_incomplete` | `control_stale` | `participation_missing` | `membership_invalid`).
Preferences rank promotions via `resolveCampaignRecoveryPromotions` but never suppress self-recoverable campaigns.
Accept flows call `persistCampaignSelectionBestEffort` (local + best-effort server) from `@rpg/api-client`.
Onboarding supports `mode: 'initial' | 'reconnect'` for setup and connection repair.

### Settings (`campaign-settings-registry.ts`)

Maps `CampaignSettingId` → rules-config location, built on the routes SSOT:

```ts
campaignSettingHref(campaignId, 'characterCreation.subclasses.enabled')
// → /campaigns/:id/homebrew/rules-config/character-configuration#subclasses
```

Section anchors match `CHARACTER_CONFIGURATION_SECTIONS` (`#multiclassing`,
`#subclasses`, …).

### Reasons (`availability-reason-registry.ts`)

Per-code presentation: title, description, severity, badge label, optional
`getAction(ctx)` (link label + `href` via settings registry).

| Code                        | Severity | Action                            |
| --------------------------- | -------- | --------------------------------- |
| `subclasses-disabled`       | warning  | Enable subclasses                 |
| `multiclassing-disabled`    | info     | Edit multiclassing rules          |
| `not-available-in-campaign` | warning  | none (toggle is beside the alert) |

## Components

- **`AvailabilityBadge`** — standalone inactive chip (most rail cards flow badge
  data through master-detail instead).
- **`AvailabilityAlert`** — composes `@rpg/ui` `Alert` from the reason registry;
  single reason shows its title/description/action, multiple reasons show a
  generic title plus a bullet list.

## Master-detail integration

Embedded editors combine toggle state + optional `resolveRowReasons` on
[`FormEmbeddedMasterDetailEditor`](../src/features/content/components/master-detail/form-embedded-master-detail-editor.client.tsx):

1. `resolveRowReasons({ row, rowKey, index })` → `AvailabilityReason[]`
2. [`resolveEmbeddedRowMeta`](../src/features/content/lib/master-detail/resolve-embedded-row-meta.ts) calls `combineAvailabilityReasons`
3. Inactive badge on the rail; [`MasterDetailEditorPanel`](../src/features/content/components/master-detail/master-detail-editor-panel.client.tsx) renders `AvailabilityAlert` above the row form

## Adding a reason code

1. Extend `AvailabilityReasonCode` and `AVAILABILITY_REASON_REGISTRY` in
   `availability-reason-registry.ts` (copy, severity, badge, optional action).
2. If the reason links to campaign settings, add `CampaignSettingId` +
   `CAMPAIGN_SETTINGS_REGISTRY` entry (reuse `configSection.id` from character
   configuration field registry for the `#anchor`).
3. Export from `index.ts`; add unit tests for href/action resolution and badge
   precedence if severity overlaps existing codes.

## Producing reasons from a feature

Pass `resolveRowReasons` from a tab that uses `FormEmbeddedMasterDetailEditor`,
or render `AvailabilityAlert` directly for banners:

```ts
resolveRowReasons: ({ row }) =>
  isSubclassChoiceFeatureRow(row) && !campaignRulesFromCtx(formCtx).subclassing.enabled
    ? [{ code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' }]
    : []
```

For standalone surfaces (species rules tab, subclasses tab banner), build
`availability` with `resolveAvailability([{ code, settingId? }])` and pass
`context={{ campaignId }}`.

Use `campaignRulesFromCtx(formCtx)` in forms; `useCampaignRules(campaignId)` on
read-only routes.

## Read-only hide vs authoring inactive

| Surface                                         | Subclass choices disabled                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Authoring** (features editor, subclasses tab) | Rows stay visible; Inactive badge + `AvailabilityAlert`; content remains in form state and save payload |
| **Read-only** (class detail, progression table) | Hide subclass list/copy and filter `subclass-choice` features from display                              |

Re-enabling the campaign rule clears badges/alerts without mutating stored
content.
