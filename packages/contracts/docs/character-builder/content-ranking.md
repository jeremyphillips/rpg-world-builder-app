# Character builder content ranking

Browse and recommendation ordering for character-builder pickers. Resolver
implementations live under `packages/contracts/src/rpg/runtime/character-builder/`;
this document is the canonical description of rank semantics.

## Canonical best-match pipeline

Every character-builder picker follows the same documented stages:

```
visibility / workflow eligibility
  → active structured filters (category, affordable, …)
  → query match (exclude score ≤ 0 when query non-empty)
  → sort mode switch
```

### `best_match` compare order

```text
if (hasQuery) compare searchScore desc
compare workflowDomainRank        // magic-item action rank, proficiency eligibility, …
compare recommendationRank        // equipment tier/reason; proficiency isRecommended/canSelect
compare name                      // deterministic fallback
```

**Name sort modes** use name as the primary key, then search score (when a query is present), then domain/recommendation rank as tiebreaker. Recommendation rank is never the primary key for name sorts.

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
sorting remains in spell drawer lib with snake_case shared mode values.

### Magic-items workflow action rank

Magic-item rows are enriched once per item with `magicItemAction` before the
drawer receives them (`enrichEquipmentPickerItemsWithMagicItemAction`). The
comparator reads only enriched state — never draft, context, or
`focusedAllowanceId`.

| Rank | `reason`             | Condition                                                 |
| ---- | -------------------- | --------------------------------------------------------- |
| 0    | `grant_available`    | `eligibility.eligible` — open choice slot                 |
| 1    | `manageable`         | Owned grant/purchase, can manage                          |
| 2    | `no_matching_choice` | Visible but no slot (`rarity_mismatch`, `allowance_full`) |
| 3    | `unavailable`        | `!canExpand`                                              |

Owned items outside a focused allowance rarity keep `reason: manageable` but
sink with `outOfFocusedScope: true` (effective rank 2).

Magic-items `best_match` order:

```text
if (hasQuery) searchScore desc
→ magicItemAction.rank
→ compareEquipmentPickerItemsByRecommendation
→ name
```

Purchase workflow omits `magicItemAction` enrichment and uses recommendation
rank only after search.

### Comparator steps (recommendation / best-match tiebreaker)

1. **Recommendation tier** — `compareEquipmentRecommendationTiers` (essential → strong → compatible → neutral → notRecommended). Constants: [`equipment-recommendation.ts`](../src/rpg/content/equipment-recommendation.ts) `EQUIPMENT_RECOMMENDATION_TIER_RANK`.
2. **Recommendation specificity** — collapsed `recommendation.specificity` via `compareEquipmentRecommendationSpecificity` (exact → narrow_pool → broad_pool). Pool expansion thresholds are classified at contribution time in [`equipment-recommendation-specificity.ts`](../src/rpg/runtime/character-builder/resolvers/equipment/equipment-recommendation-specificity.ts): 1 match = exact, 2–5 = narrow_pool, 6+ = broad_pool; `{ kind: 'equipment' }` selectors are always exact.
3. **Best reason** — lowest rank among `recommendation.reasons` via `getBestEquipmentRecommendationReasonRank`. Constants: `EQUIPMENT_RECOMMENDATION_REASON_RANK`.
4. **Starting affordability** — `state.isAffordable` (`true` before `false`). Deprioritizes items that exceed the package starting budget without hiding them (unless the dashboard `filterOutUnaffordable` prop is on).
5. **Kind bucket** — `getEquipmentRecommendationKindRank` (weapon → shield → armor → tool → spellcastingGear → gear → ammunition → other). Constants: [`equipment-picker-item-kind-rank.ts`](../src/rpg/runtime/character-builder/resolvers/picker/equipment-picker-item-kind-rank.ts).
6. **Weapon category** — `getEquipmentWeaponCategoryBrowseRank` when both rows are weapons; martial-first only when `preferMartialWeaponBrowseOrder` is set on the browse context.
7. **Name** — `localeCompare` (base sensitivity).

### Recommendation reason ranks

Lower ranks list first within the same tier (`EQUIPMENT_RECOMMENDATION_REASON_RANK`):

`classRequired` → `classToolNeed` → `selectedToolProficiency` → `spellcastingFocus` →
`startingEquipment` → `unresolvedToolProficiencyChoice` → `startingEquipmentChoice` →
`classToolCategory` → `availableInStartingOption` → `classSuggested` → `proficient` →
`notProficient`.

Inference layers live in `derive-equipment-recommendation-contributions.ts` (proficiency
pools, starting-equipment pools, fulfillment-aware gold elevation).

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
2. **Selectable** — `state.canSelect` (`true` before `false`)
3. **Label** — `localeCompare` (base sensitivity)

| Mode         | Primary         | Tiebreaker 1 (query only) | Tiebreaker 2      |
| ------------ | --------------- | ------------------------- | ----------------- |
| `best_match` | search score    | —                         | domain comparator |
| `name_*`     | `Intl.Collator` | search score              | domain comparator |

Empty-query best match uses domain rank only — not name-only fallback.

### Clear filters vs Reset view

Mutually exclusive toolbar actions (`toolbarResetMode` on `EquipmentPickerDrawer`;
production default `reset_view`):

| Action            | Resets                                 | Preserves |
| ----------------- | -------------------------------------- | --------- |
| **Clear filters** | search, category, Affordable now       | sort      |
| **Reset view**    | search, category, Affordable now, sort | —         |

Action buttons show no counts.

## Picker state: dual affordability

`resolveEquipmentPickerItems` maps budget helpers onto picker state:

| State field               | Budget helper                           | Semantics                                                                                     |
| ------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `isAffordable`            | `isEquipmentAffordableAtStartingBudget` | UI shorthand; stable across purchases. Drives `filterOutUnaffordable` and browse-sort step 3. |
| `isWithinRemainingBudget` | `isEquipmentWithinRemainingBudget`      | Dynamic; drives purchase disable and remaining-budget disabled notes.                         |

When **no budget** is passed to `resolveEquipmentPickerItems`, both fields default
to `true`. That means budget gating is inactive — not that a comparison ran.

`remaining <= starting` is guaranteed by `deriveEquipmentBudgetSummary`; a
starting-unaffordable / remaining-affordable (`false` / `true`) pair cannot occur.

## Dashboard disabled-note precedence

In `equipment-picker-drawer.lib.ts`, `getEquipmentPickerDisabledNote` resolves in order:

1. `disabledReasons[0]` — structural restrictions (selection full, already granted, etc.)
2. Remaining-budget failure — `!isWithinRemainingBudget` → `{cost} needed · {remaining} remaining` using `budget.remaining`
3. `undefined`

`isEquipmentPickerItemDisabled` is `true` when `disabledReasons.length > 0` or
`!isWithinRemainingBudget`. Starting-budget unaffordability alone does not disable
purchase when a row is shown with `filterOutUnaffordable={false}`.

## Dashboard affordability filters

The equipment picker exposes two independent affordability controls:

| Control                                            | Source                          | Default | Semantics                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filterOutUnaffordable` prop                       | `state.isAffordable`            | `false` | When `true`, hides rows above the package starting budget; default shows them disabled instead.                                                                                 |
| **Affordable now** checkbox (`showAffordableOnly`) | `state.isWithinRemainingBudget` | `false` | Disabled in the equipment picker drawer for now; when enabled, user opt-in hides rows the character cannot purchase with remaining budget. Shown only when a budget is present. |

Browse context (search, category, sort) is **preserved** across drawer
close/reopen within a builder session. **Reset view** (default) resets the full view;
**Clear filters** resets structured inclusion and search only.
Context-key reset (character, equipment method, budget change) is a documented follow-up.

Row disabled notes and the budget header use the shared `EmphasisDetailLine`
pattern: foreground primary stat (`5 GP remaining`, `75 GP needed`) plus a muted
secondary tail (`100 GP starting · 95 GP spent`, `40 GP remaining`).

## Equipment picker badge precedence

`getEquipmentPickerBadge` in `equipment-picker-drawer.lib.ts` emits **one badge per
row**. Copy is **reason-driven** — do not infer proficiency-state labels from
equipment kind alone.

`state.isProficient` remains factual (resolved proficiencies only). Badge copy
interprets unresolved recommendation context; it does not redefine proficiency for
preview or combat semantics.

### Single-badge order

1. **Essential / class-required blockers** — authored `label`, `classRequired`,
   `classToolNeed`, `spellcastingFocus`
2. **Proficiency-state explanations** — `selectedToolProficiency` → **Proficient**;
   `unresolvedToolProficiencyChoice` → **Proficiency available**;
   `classToolCategory` → **Common for your class**
3. **Starting-equipment / class recommendation source** — `startingEquipmentChoice` →
   **Starting option**; `availableInStartingOption` → **Standard gear** on gold path
   only (`isGoldShoppingPath` on the drawer)
4. **Not proficient** — when `!isProficient` and no higher-priority reason applies

Proficiency-state badges outrank ordinary recommendation-source badges (e.g. a Bard
instrument with both `unresolvedToolProficiencyChoice` and `startingEquipmentChoice`
shows **Proficiency available**). Essential blockers outrank generic proficiency copy.

Ordinary weapon/armor category proficiency (`proficient` reason, `isProficient: true`
without `selectedToolProficiency`) stays **badge-less**.

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
| **Content availability** | Is this catalog row allowed in the campaign/build context? | `resolveAvailableContent` (SSOT)                                                           |
| **Acquisition**          | How does the draft obtain the item?                        | Package, purchase, magic allowance, or domain `ensureEquipmentGrant` on `equipment.grants` |
| **Affordability**        | Can starting wealth cover a **purchase**?                  | Purchase channel only (`resolveEquipmentPurchaseAvailability`, budget planners)            |

- Content availability ≠ purchasable ≠ affordable.
- Quick NPC / automatic resolution never uses `ignoreAffordability` or purchase-shaped fake grants.
- Domain grants use durable `{ kind: 'grant' }` provenance on finalized inventory rows.
- `deriveEquipmentDraftEntries` is the single inventory assembler — grant rows are ensure-at-least-N relative to other channels.

**Named follow-up (`equipment-picker-availability-vm`):** the equipment purchase picker currently collapses unaffordable rows into disabled/unavailable (`isEquipmentPickerItemDisabled` in dashboard). A follow-up should expose distinct VM fields (`available`, `purchaseEligible`, `affordable`) without redesigning purchase math — not in the grant/availability pin PR.
