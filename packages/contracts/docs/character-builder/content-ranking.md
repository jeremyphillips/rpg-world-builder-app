# Character builder content ranking

Browse ordering for character-builder pickers. Each picker has its own comparator.
Resolver implementations live under `packages/contracts/src/rpg/runtime/character-builder/`.

Shared stages before that comparator:

```
visibility / workflow eligibility
  → active structured filters (category, affordable, …)
  → query match (exclude score ≤ 0 when query non-empty)
  → sort mode switch
```

Spell and proficiency best match is recommended, then name
(`compareRecommendedThenName`). Equipment best match is
`compareIntentionalEquipmentRanking`. Connection drawers are separate and are
not covered here.

Browse order ignores selection, remaining budget, and consumed grants. Those
facts stay on the row as chrome and disabled actions.

**Name sort modes** use name as the primary key, then search score (when a query is present), then the domain comparator as a tiebreaker. The domain comparator is never the primary key for name sorts.

Shared sort mode values (`best_match`, `name_asc`, `name_desc`) live in
`catalog-picker-sort-modes.lib.ts`. Domain-specific modes (`price_*`, `level_*`) stay in each picker's `*.types.ts`.

## Equipment picker browse order

When the equipment picker search query is empty and sort mode is **Best match**,
rows sort via `compareEquipmentPickerItemsByRecommendation` in
[`equipment-picker-item.ts`](../src/rpg/runtime/character-builder/resolvers/picker/equipment-picker-item.ts).

The equipment picker owns search inclusion and ordering through
`filterAndSortEquipmentPickerItems` in the dashboard
(`equipment-picker-drawer.lib.ts`). Proficiency picker sorting uses the same
score-once pipeline via `filterAndSortProficiencyPickerItems`. Spell picker
sorting uses `filterAndSortSpellPickerItems` in `spell-picker-drawer.lib.ts`;
domain rank comes from `compareSpellPickerItemsByRecommendation` in
[`spell-picker-item.ts`](../src/rpg/runtime/character-builder/resolvers/picker/spell-picker-item.ts).
Recommended spell ids are resolved in
[`resolve-spell-recommendations.ts`](../src/rpg/runtime/character-builder/resolvers/spellcasting/resolve-spell-recommendations.ts).

### Magic-item action state

Magic-item rows are enriched once per item with `magicItemAction` before the
drawer receives them (`enrichEquipmentPickerItemsWithMagicItemAction`). That
state drives the row action. Browse order does not read it, including grant
availability and whether the focused allowance was consumed.

| `reason`             | Condition                                                 |
| -------------------- | --------------------------------------------------------- |
| `grant_available`    | `eligibility.eligible` — open choice slot                 |
| `manageable`         | Owned grant/purchase, can manage                          |
| `no_matching_choice` | Visible but no slot (`rarity_mismatch`, `allowance_full`) |
| `unavailable`        | `!canExpand`                                              |

Owned items outside a focused allowance rarity keep `reason: manageable` and
set `outOfFocusedScope: true`.

### Comparator steps (recommendation / best-match tiebreaker)

Resolved rows sort with `compareIntentionalEquipmentRanking` in
[`equipment-ranking-policy.ts`](../src/rpg/runtime/character-builder/resolvers/equipment/equipment-ranking-policy.ts).
Requirements, soft recommendations, and option state are separate facts. Selection,
remaining budget, and package choice do not reorder rows.

1. **Requirement match** — any requirement the row satisfies (`optionSatisfies`), exact before anyOf. `candidate`, `satisfier`, and `eligible` share that band. A `requirement` active choice limits the match to that requirement id. `activeRequirementIds`, when set, limits which ids count. Spellcasting focus is one any-of requirement owned by the class.
2. **Recommendation strength** — strongest signal only (`strong` → `compatible` → `neutral` → `discouraged`). Source count does not promote strength. A class starting-equipment candidate (any available option, grant or choice pool) is a `compatible` class signal with reason `startingEquipment`. That set does not follow the selected package, fulfilled grants, or remaining budget. Starting-equipment membership may contribute recommendation strength for ranking, but its user-facing guidance is owned by package-state presentation. Only independent recommendation evidence produces **Recommended by class**. Proficiency is compatibility, not a signal.
3. **Specificity / source policy** — exact → narrow_pool → broad_pool, then source priority (user, title, role, class, subclass, organization, species, origin, feat). Pool expansion thresholds stay in [`equipment-recommendation-specificity.ts`](../src/rpg/runtime/character-builder/resolvers/equipment/equipment-recommendation-specificity.ts). Open-pool eligibility, context relevance, and alternative-package membership are not sort keys.
4. **Compatibility** — only when `rankCompatibility` is set (the default). Proficient, then untracked (`compatibility.proficient` omitted), then not proficient. `unaffordable` does not add a further penalty: not proficient and unaffordable stays with not proficient.
5. **Exceeds starting budget** — price above `purchaseBudgetCeiling`, the maximum `totalStartingWealth` across available packages. That total is class-option wealth plus the tier bonus. Spent gold and the selected package do not change it. A shortfall against the current purse stays **Cannot afford** and does not reorder. Unpriced rows do not exceed the ceiling.
6. **Not for sale** — only when `rankPurchaseAvailability` is set (gold purchase lists). `unavailableForPurchase` sorts after every other purchase status. `unaffordable` does not reorder. A strong or required row still outranks a neutral purchasable row. Other lists leave this fact unsorted.
7. **Canonical fallback** — kind bucket, weapon category, then name.

Rows without `resolved` facts sort as a neutral recommendation. There is no tier/reason fallback.

### Recommendation object versus browse order

`EQUIPMENT_RECOMMENDATION_REASONS` is evidence identity on the recommendation object. It is not a browse key. `EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE` and `EQUIPMENT_RECOMMENDATION_SPECIFICITY_PRECEDENCE` collapse that object when several contributions merge. Picker browse does not read them. Browse specificity is `compareSpecificity`.

Proficiency is not a recommendation reason. `compatibility.proficient` is `true`, `false`, or omitted when the item does not track proficiency.

`classToolNeed` is no longer emitted. A fixed class tool proficiency is `compatibility.proficient` plus `proficiencySources`, and the picker badge is **Proficient**.

Browse badges read `resolved.presentation` from `resolveEquipmentPresentationFacts`. Contracts own the phrases ("Required by class", "Matches focus requirement", "Included in package option", "Recommended by class"). The dashboard orders guidance as requirement, requirement match, package option, then recommendation. Open-pool source guidance stays after recommendations. A selected package does not add package row guidance; ownership provenance shows **Package**. The dashboard maps facts to tone, keeps one badge, shows up to two sources inline, and puts the full list in the badge title.

Canonical kind order is weapon → shield → armor → tool → spellcastingGear → gear → ammunition → other. Weapon category is martial-first only when `preferMartialWeaponBrowseOrder` is set. Name uses `localeCompare` (base sensitivity).

Inference layers live in `derive-equipment-recommendation-contributions.ts` (proficiency
pools, starting-equipment pools, fulfillment-aware gold elevation). Proficiency compatibility is projected from the character and the equipment row, not from those recommendation contributions.

### Equipment picker sort modes

| Mode                       | Primary                           | Tiebreaker 1 (query only) | Tiebreaker 2              |
| -------------------------- | --------------------------------- | ------------------------- | ------------------------- |
| `best_match`               | search score when query non-empty | —                         | recommendation comparator |
| `price_asc` / `price_desc` | price (`moneyToCopper`)           | search score              | recommendation comparator |
| `name_asc` / `name_desc`   | `Intl.Collator` on name           | search score              | recommendation comparator |

**Empty-query best match (purchase):** recommendation comparator only — no search-score step.

**Search inclusion:** when the query is non-empty, rows with `@rpg/search`
match score ≤ 0 on the assembled equipment picker `SearchDocument` (primary
combined field) are excluded before sort.

**Unknown cost:** rows without a known `equipment.cost` are not treated as zero
or expensive. In price sorts, priced rows come first in both directions;
unknown-cost pairs defer to search score / recommendation tiebreakers.

**View defaults:** `EQUIPMENT_PICKER_VIEW_DEFAULTS` in `equipment-picker-drawer.lib.ts`
— category All, Affordable now off, sort Best match.

## Proficiency picker browse order

`filterAndSortProficiencyPickerItems` in `proficiency-picker-drawer.lib.ts`
implements the canonical pipeline. Domain rank comes from
`compareProficiencyPickerItemsByRecommendation` in
[`proficiency-picker-item.ts`](../src/rpg/runtime/character-builder/resolvers/picker/proficiency-picker-item.ts):

1. **Recommended** — `state.isRecommended` (`true` before `false`; languages only today)
2. **Label** — `localeCompare` (base sensitivity) via `compareRecommendedThenName`

| Mode         | Primary         | Tiebreaker 1 (query only) | Tiebreaker 2      |
| ------------ | --------------- | ------------------------- | ----------------- |
| `best_match` | search score    | —                         | domain comparator |
| `name_*`     | `Intl.Collator` | search score              | domain comparator |

Empty-query best match uses domain rank only — not name-only fallback.

## Spell picker browse order

`filterAndSortSpellPickerItems` in `spell-picker-drawer.lib.ts` implements the
canonical pipeline. Domain rank comes from `compareSpellPickerItemsByRecommendation`
in [`spell-picker-item.ts`](../src/rpg/runtime/character-builder/resolvers/picker/spell-picker-item.ts):

1. **Recommended** — `state.isRecommended` (`true` before `false`)
2. **Label** — `localeCompare` (base sensitivity) via `compareRecommendedThenName`

| Mode         | Primary         | Tiebreaker 1 (query only) | Tiebreaker 2      |
| ------------ | --------------- | ------------------------- | ----------------- |
| `best_match` | search score    | —                         | domain comparator |
| `name_*`     | `Intl.Collator` | search score              | domain comparator |
| `level_*`    | spell level     | search score              | domain comparator |

Empty-query best match uses domain rank only — not name-only fallback.

### Clear filters vs Reset view

Mutually exclusive toolbar actions (`toolbarResetMode` on `EquipmentPickerDrawer`;
production default `reset_view`):

| Action            | Resets                                 | Preserves |
| ----------------- | -------------------------------------- | --------- |
| **Clear filters** | search, category, Affordable now       | sort      |
| **Reset view**    | search, category, Affordable now, sort | —         |

Both modes use the shared Reset button. Action buttons show no counts.

## Picker purchase availability

`resolveEquipmentPickerItems` stamps `purchaseAvailability` once from remaining budget and copies that same object onto `state.resolved`. Actions and badges read every status. Purchase-list sort treats `unavailableForPurchase` as a late negative and does not rank `unaffordable`.

| Status                   | Meaning                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `available`              | Priced, and the remaining purse covers quantity 1 (or no budget is set)                |
| `unaffordable`           | Priced above `budget.remaining`; `shortfallCp` is the gap                              |
| `unavailableForPurchase` | `no_market_price` presents as "Not for sale"; `unsupported_kind` as "Unavailable here" |

`isWithinRemainingBudget` is `purchaseAvailability.status === 'available'`. When no budget is passed, priced rows stay `available`.

`fitsStartingEquipmentBudget` is not picker state. `filterOutUnaffordable` calls it with the package starting purse and skips unpriced rows.

## Dashboard disabled-note precedence

In `equipment-picker-drawer.lib.ts`, `getEquipmentPickerDisabledNote` maps
`resolveEquipmentPickerPurchaseActionState` reasons to copy:

1. `blocked` — `disabledReasons[0]` (structural restrictions; not content availability)
2. `not_purchasable` — "Not for sale" for `no_market_price`, "Unavailable here" for `unsupported_kind`
3. `unaffordable` — `{cost} needed · {remaining} remaining` via `budget.remaining`
4. `undefined` when purchase action is enabled

Purchase add/disable uses `resolveEquipmentPickerPurchaseActionState` — not a
collapsed `isEquipmentPickerItemDisabled` bit. Row availability fields live in
`equipment-picker-availability.lib.ts`:

| Field              | Meaning                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `contentAvailable` | Campaign/content — wired via `resolvePlayableBuilderContent` in equipment-step picker assembly |
| `purchaseEligible` | Purchase channel supported                                                                     |
| `affordable`       | Remaining budget covers qty=1 (`purchaseAvailability.status === 'available'`)                  |

## Dashboard affordability filters

The equipment picker exposes two independent affordability controls:

| Control                                            | Source                                           | Default | Semantics                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filterOutUnaffordable` prop                       | `fitsStartingEquipmentBudget(equipment, budget)` | `false` | When `true` and a budget is passed, hides priced rows above the package starting purse. Unpriced rows stay visible.                                                             |
| **Affordable now** checkbox (`showAffordableOnly`) | `purchaseAvailability.status === 'available'`    | `false` | Disabled in the equipment picker drawer for now; when enabled, user opt-in hides rows the character cannot purchase with remaining budget. Shown only when a budget is present. |

Browse context (search, category, sort) is **preserved** across drawer
close/reopen within a builder session. **Reset view** (default) resets the full view;
**Clear filters** resets structured inclusion and search only.
Context-key reset (character, equipment method, budget change) is a documented follow-up.

Row disabled notes and the budget header use the shared `EmphasisDetailLine`
pattern: foreground primary stat (`5 GP remaining`, `75 GP needed`) plus a muted
secondary tail (`100 GP starting · 95 GP spent`, `40 GP remaining`).

## Equipment picker row status

Picker rows no longer pick a single badge. Every applicable signal renders on one
ordered status line: blockers, then compatibility warnings, then requirement,
recommendation, and source guidance. Rank tables, dedupe, and per-surface visibility
are dashboard-owned. See
[character-builder-picker-chrome.md](../../../../apps/dashboard/docs/character-builder-picker-chrome.md#selection-row-status-guidance-and-context-policy).

Contracts own the copy through `resolveEquipmentPresentationFacts`:

- **Requirements:** kind-based. "Required by class" for an exact need, "Matches focus
  requirement" for an open focus `anyOf`, and "Satisfies focus requirement" for the
  satisfier.
- **Recommendations:** "Recommended by class", "Recommended by species", and so on.
- **Source state:** an alternative starting package reads "Included in package option".
  The builder shows it on the gold path only (`isGoldShoppingPath` on the drawer). An
  open tool-proficiency pool reads "Proficiency available".
- **Compatibility:** "Not proficient" and "Requires STR 15", each with a detail sentence.

`state.isProficient` remains factual (resolved proficiencies only). Ordinary
weapon or armor category proficiency adds nothing to the line. Missing proficiency and
an unmet ability score are cautions, not recommendation tiers, and neither changes
Best Match ranking.

## Starting-equipment contribution context

`deriveStartingEquipmentRecommendationContributions` uses
`StartingEquipmentContributionContext`:

| Context             | Nested unresolved pool                     | Fixed grant (not fulfilled)                |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| `unselected_option` | `compatible` + `availableInStartingOption` | `compatible` + `availableInStartingOption` |
| `selected_package`  | `strong` + `startingEquipmentChoice`       | suppressed when fulfilled                  |
| `gold_alternative`  | `strong` + `startingEquipmentChoice`       | `strong` + `availableInStartingOption`     |

When a wealth-only (gold) option is selected, shopping guidance is derived from
non-wealth starting options. Without explicit pairing metadata, all non-wealth
options are unioned (mutually exclusive branches); contributions are deduplicated by
`sourceKey`. Proficiency-linked grants are skipped — tools come from the proficiency
layer only.

## Related modules

- Recommendations: `deriveEquipmentRecommendations` — tier/reason assignment only; no sort.
- Budget: `deriveEquipmentBudgetSummary`, `maxAffordableEquipmentQuantity` (remaining-based).
- Resolver catalog: [character-builder-resolvers.md](character-builder-resolvers.md).

## Equipment availability vs acquisition vs affordability

Three layers — do not collapse them in new code:

| Layer                    | Question                                                   | Owner                                                                                      |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Content availability** | Is this catalog row allowed in the campaign/build context? | `resolvePlayableBuilderContent` (SSOT)                                                     |
| **Acquisition**          | How does the draft obtain the item?                        | Package, purchase, magic allowance, or domain `ensureEquipmentGrant` on `equipment.grants` |
| **Affordability**        | Can starting wealth cover a **purchase**?                  | Purchase channel only (`resolveEquipmentPurchaseAvailability`, budget planners)            |

- Content availability ≠ purchasable ≠ affordable.
- Quick NPC / automatic resolution never uses `ignoreAffordability` or purchase-shaped fake grants.
- Domain grants use durable `{ kind: 'grant' }` provenance on finalized inventory rows.
- `deriveEquipmentDraftEntries` is the single inventory assembler — grant rows are ensure-at-least-N relative to other channels.

Equipment picker row VMs (`equipment-picker-availability.lib.ts` in dashboard) expose
`contentAvailable`, `purchaseEligible`, and `affordable` with purchase actions resolved
via `resolveEquipmentPickerPurchaseActionState`.
