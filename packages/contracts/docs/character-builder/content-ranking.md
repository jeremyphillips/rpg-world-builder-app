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
sorting uses `filterAndSortSpellPickerItems` in `spell-picker-drawer.lib.ts`;
domain rank comes from `compareSpellPickerItemsByRecommendation` in
[`spell-picker-item.ts`](../src/rpg/runtime/character-builder/resolvers/picker/spell-picker-item.ts).
Recommended spell ids are resolved in
[`resolve-spell-recommendations.ts`](../src/rpg/runtime/character-builder/resolvers/spellcasting/resolve-spell-recommendations.ts).

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

Resolved rows sort with `compareIntentionalEquipmentRanking` in
[`equipment-ranking-policy.ts`](../src/rpg/runtime/character-builder/resolvers/equipment/equipment-ranking-policy.ts).
Requirements, soft recommendations, and option state are separate facts. Selection and
choice state never change recommendation strength.

1. **Active requirement / active choice** — unsatisfied `candidate` requirements (`compareActiveRequirement`), then open-pool eligibility when `activeChoice` is `pool` or `package`. A satisfied pool keeps `optionSatisfies` on every eligible option; only the owned option is a `satisfier`, and the others stay `eligible` with no lift. Spellcasting focus is one any-of requirement owned by the class.
2. **Context relevance** — only when `activeChoice` is not `none`. `allowance` does not reorder equipment recommendations; magic-item action rank handles that workflow. The general Add Equipment drawer passes `none`, so open pools and alternative packages do not lift rows there.
3. **Recommendation strength** — strongest signal only (`strong` → `compatible` → `neutral` → `discouraged`). Source count does not promote strength. Proficiency is compatibility, not a signal.
4. **Specificity / source policy** — exact → narrow_pool → broad_pool, then source priority (user, title, role, class, subclass, organization, species, origin, feat), then `inAlternativePackage` as a tie-break. Pool expansion thresholds stay in [`equipment-recommendation-specificity.ts`](../src/rpg/runtime/character-builder/resolvers/equipment/equipment-recommendation-specificity.ts).
5. **Purchase actionability** — only when `rankPurchaseAvailability` is set (gold purchase lists). Order is `available`, then `unaffordable`, then `unavailableForPurchase`. A strong or required row still outranks a neutral purchasable row. Unaffected lists leave this fact unsorted.
6. **Compatibility** — only when `rankCompatibility` is set (the default) and both rows have a defined `compatibility.proficient`. `true` before `false`. Rows that do not track proficiency stay ties on this axis.
7. **Canonical fallback** — kind bucket, weapon category, then name.

Rows without `resolved` facts sort as a neutral recommendation. There is no tier/reason fallback.

### Recommendation reason ranks

The legacy reason enum still feeds badges until presentation facts replace it. It is not the browse order for resolved rows.

Lower historical ranks (`EQUIPMENT_RECOMMENDATION_REASON_RANK`):

`classRequired` → `classToolNeed` → `selectedToolProficiency` → `spellcastingFocus` →
`startingEquipment` → `unresolvedToolProficiencyChoice` → `startingEquipmentChoice` →
`classToolCategory` → `availableInStartingOption` → `classSuggested`.

Proficiency is not a recommendation reason. `compatibility.proficient` is `true`, `false`, or omitted when the item does not track proficiency.

`classToolNeed` is no longer emitted. A fixed class tool proficiency is `compatibility.proficient` plus `proficiencySources`, and the picker badge is **Proficient**.

Browse badges read `resolved.presentation` from `resolveEquipmentPresentationFacts`. Contracts own the phrases ("Required by Wizard class", "Spellcasting focus", "In your package"). The dashboard maps those facts to tone, keeps one badge, shows up to two sources inline, and puts the full list in the badge title.

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
2. **Selectable** — `state.canSelect` (`true` before `false`)
3. **Label** — `localeCompare` (base sensitivity)

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
2. **Selectable** — `state.canSelect` (`true` before `false`)
3. **Label** — `localeCompare` (base sensitivity)

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

Action buttons show no counts.

## Picker purchase availability

`resolveEquipmentPickerItems` stamps `purchaseAvailability` once from remaining budget and copies that same object onto `state.resolved`. Action, badges, and purchase-list sort all read it.

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
4. **Not proficient** — when `compatibility.proficient === false` and no higher-priority fact applies. The sentence comes from `resolveEquipmentNotProficientMessage`.

Proficiency-state badges outrank ordinary recommendation-source badges (e.g. a Bard
instrument with both `unresolvedToolProficiencyChoice` and `startingEquipmentChoice`
shows **Proficiency available**). Essential blockers outrank generic proficiency copy.

Ordinary weapon/armor category proficiency (`compatibility.proficient === true`
without `selectedToolProficiency`) stays **badge-less**. Missing proficiency is a
caution, not a recommendation tier.

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
