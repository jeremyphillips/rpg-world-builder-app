# Character sheet routing and access

How standalone and campaign PC sheet URLs relate, who can load them, and how
dashboard links should be built.

## URL surfaces

| Surface          | Route                                            | API                                                      |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Personal index   | `/characters`                                    | `GET /api/characters`                                    |
| Standalone sheet | `/characters/:characterId`                       | `GET /api/characters/:id`                                |
| Campaign list    | `/campaigns/:campaignId/characters`              | `GET /api/campaigns/:campaignId/characters`              |
| Campaign sheet   | `/campaigns/:campaignId/characters/:characterId` | `GET /api/campaigns/:campaignId/characters/:characterId` |

Build detail links with `resolveCharacterDetailHref()` in
`apps/dashboard/src/lib/routing/resolve-character-detail-href.ts`. List rows
use `routeContext` from the personal list API; explicit campaign scope uses
`{ scope: 'campaign', campaignId, characterId }`.

## Core invariants

1. **Closing participation** (`leftAt` set) removes a character from campaign
   grouping, list scope, and campaign sheet access.
2. **Roster status or control changes** do not change routing or grouping while
   open participation remains.
3. **Open participation** and **control assignment** are independent:
   - Open participation → canonical campaign URL; **In campaigns** group on the
     personal index.
   - Control assignment → My character(s) list membership and `canEdit`; does
     not affect visibility.
4. **Active viewer membership** gates every campaign read. Former members lose
   campaign sheet access immediately, even when the character remains
   open-participating.

## Standalone redirect (canonicalization)

`/characters/:id` wraps the sheet in `StandaloneCharacterRedirectGuard`:

1. Owner loads the standalone route.
2. Client calls `GET /api/characters/:id/routing-context`.
3. When the response includes `openCampaign` and the viewer is authorized,
   navigate with `replace: true` to the campaign sheet URL.
4. The campaign route re-verifies membership via the campaign character GET —
   routing-context alone is not sufficient on arrival.

Non-owners who are not active members of the open campaign never receive
`openCampaign` from routing-context (404 concealment).

## 404 concealment vs scoped 403

| Endpoint                                        | Unauthorized access                                             | Rationale                             |
| ----------------------------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `GET /api/characters/:id`                       | **404** for non-owners                                          | Owner-only; conceal existence         |
| `GET /api/characters/:id/routing-context`       | **404** unless owner or active member of resolved open campaign | No campaign metadata leak             |
| `GET /api/campaigns/:campaignId/characters/:id` | **403** non-member; **404** not-in-campaign                     | Membership establishes scoped context |

Campaign list (`GET .../characters`) returns **403** for observers; observers
discover sheets through Party or direct links.

## Link migration checklist

- Personal index cards → `resolveCharacterDetailHref(character)` from list
  `routeContext`.
- Campaign party / characters list → `ROUTES.campaign.characters.detail(...)`.
- Onboarding and builder finalize → campaign detail after assignment.
- Organization-connected character cards → `resolveCampaignCharacterDetailHref`
  (PC vs NPC).
- Standalone bookmarks → redirect guard canonicalizes to campaign URL when
  applicable.
- Admin user character list → standalone detail (admin is not a campaign
  viewer; owner-only standalone API applies).

## Card display

- Personal index cards show the campaign name (`showCampaign` default).
  Campaign party and characters list surfaces pass `showCampaign={false}` because
  the page already provides campaign context.
- Controller copy (**No player assigned** / **Played by you** / **Played by
  {name}**) is resolved by `resolveCharacterControllerDisplay()` in
  `apps/dashboard/src/features/character/lib/display/character-controller-display.ts`
  and rendered inside `CharacterListCard` via the `controllerLine` prop.
  **Played by you** uses `controlledCharacterIds.includes(characterId)`, not
  display-name comparison.

## Summary formatting

Character card and detail-header summaries are **derived at read time** from
structured sheet data — never persisted on character records.

- **Canonical formatter:** `formatCharacterSummary()` in
  `@rpg/contracts` (`packages/contracts/src/rpg/runtime/character/character-summary-format.ts`).
  Input shape: `CharacterSummaryParts` (resolved species, heritage, and class
  labels + levels).
- **Label resolution:** API and dashboard adapters map content IDs to labels
  from their local catalog indexes, then call the shared formatter.
  - API: `buildCharacterCardSummaryDto()` in
    `apps/api/src/features/character/lib/build-character-card-summary-dto.lib.ts`
  - Dashboard: `formatCharacterSummaryFromCatalog()` in
    `apps/dashboard/src/features/character/lib/display/character-summary.lib.ts`
  - Builder preview: `preview-identity-summary.ts` uses the same formatter
    primitives; partial drafts omit unresolved segments.
- **Card DTOs:** `characterCardSummarySchema` is the base transport shape
  (`id`, `name`, `summary`). Endpoint DTOs extend it by composition (campaign
  card, organization card, personal card) rather than duplicating fields.

Per-class levels appear in summaries **only for multiclass** characters
(`Dwarf · Level 4 · Fighter 3 / Rogue 1`). Single-class rows use
`Dwarf · Level 4 Fighter` — not `Fighter 4`.

## Campaign character navigation

Sidebar **My Character** / **My Characters** / **Characters** labels, hrefs,
and active highlighting are resolved from the viewer's **open control
assignments** — not raw membership control ids or a fixed list link.

- **Combined context:** `buildCampaignCharacterNavigationContext()` in
  `apps/dashboard/src/features/campaign/lib/build-campaign-character-navigation-context.ts`
  returns sibling `nav` and `list` models from the same precedence evaluation.
  `useCampaignCharacterNavigationContext()` is a thin hook over campaign list
  data plus that builder.
- **Precedence (first match wins):** observer (hidden) → manager → one or more
  open controlled PCs → onboarding incomplete with zero open control → post-
  onboarding empty control list.
- **Open control source of truth:** `openControlledCharacterIds` on
  `CampaignListItem` from `GET /api/campaigns` — controlled ids intersected
  with open participations and deduped server-side. Navigation must not
  re-intersect on the client. Campaign character list/detail API routes consume
  the same invariant via middleware `req.campaignMembership.pcCharacterIds`.
- **`activeSection` vs `mode`:** `mode` describes the nav destination (list,
  detail, onboarding). `activeSection` drives sidebar highlighting via prefix
  matching on `/campaigns/:campaignId/characters` (including detail routes) or
  the onboarding route only.
- **Cache invalidation:** control assign/remove and onboarding-complete flows
  invalidate `campaignsQueryKey` through
  `invalidateCampaignCharacterControlQueries()`.
- **Detail race fallback:** when a sole controlled character disappears before
  detail load, the error shell links **Back to {nav label}** using refreshed
  nav context — not a stale detail href.

See [Availability](./availability.md) for `viewerOnboardingState` on campaign
list rows.

## Error copy (route shells)

User-visible messages come from API responses via `resolveQueryErrorLabel`.
Reference constants live in
`apps/dashboard/src/features/character/lib/character-sheet-error-labels.ts`.
Visual states are documented in Storybook:
`Character/CharacterSheetDetailShell`.

## Related docs

- [Character acquisition](./character-acquisition.md) — participation vs control
- [Character vital and campaign participation](./character-vital-and-campaign-participation.md) — roster vs vital
- [Availability](./availability.md) — campaign onboarding states
