# Character builder content ranking

Browse and recommendation ordering for character-builder pickers. Resolver
implementations live under `packages/contracts/src/rpg/runtime/character-builder/`;
this document is the canonical description of rank semantics.

## Equipment picker browse order

When the equipment picker search query is empty, rows sort via
`compareEquipmentPickerItemsByRecommendation` in
[`equipment-picker-item.ts`](../src/rpg/runtime/character-builder/resolvers/picker/equipment-picker-item.ts).

Search (`CatalogPickerSheet` / `rankItems`) stays **text-score-first**; the browse
order below applies only when the query is empty.

### Comparator steps

1. **Recommendation tier** — `compareEquipmentRecommendationTiers` (essential → strong → compatible → neutral → notRecommended). Constants: [`equipment-recommendation.ts`](../src/rpg/content/equipment-recommendation.ts) `EQUIPMENT_RECOMMENDATION_TIER_RANK`.
2. **Best reason** — lowest rank among `recommendation.reasons` via `getBestEquipmentRecommendationReasonRank`. Constants: `EQUIPMENT_RECOMMENDATION_REASON_RANK`.
3. **Starting affordability** — `state.isAffordable` (`true` before `false`). Deprioritizes items that exceed the package starting budget without hiding them (unless the dashboard `filterOutUnaffordable` prop is on).
4. **Kind bucket** — `getEquipmentRecommendationKindRank` (weapon → shield → armor → tool → spellcastingGear → gear → ammunition → other). Constants: [`equipment-picker-item-kind-rank.ts`](../src/rpg/runtime/character-builder/resolvers/picker/equipment-picker-item-kind-rank.ts).
5. **Weapon category** — `getEquipmentWeaponCategoryBrowseRank` when both rows are weapons; martial-first only when `preferMartialWeaponBrowseOrder` is set on the browse context.
6. **Name** — `localeCompare` (base sensitivity).

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

| Control                                            | Source                          | Default | Semantics                                                                                                         |
| -------------------------------------------------- | ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `filterOutUnaffordable` prop                       | `state.isAffordable`            | `true`  | Hides rows above the package starting budget.                                                                     |
| **Affordable now** checkbox (`showAffordableOnly`) | `state.isWithinRemainingBudget` | `false` | User opt-in; hides rows the character cannot purchase with remaining budget. Shown only when a budget is present. |

Browse context (search, category, affordable toggle, active tab) is **preserved**
across drawer close/reopen within a builder session. **Clear filters** resets
search, category, and Affordable now together. Context-key reset (character,
equipment method, budget change) is a documented follow-up.

Row disabled notes and the budget header use the shared `EmphasisDetailLine`
pattern: foreground primary stat (`5 GP remaining`, `75 GP needed`) plus a muted
secondary tail (`100 GP starting · 95 GP spent`, `40 GP remaining`).

## Related modules

- Recommendations: `deriveEquipmentRecommendations` — tier/reason assignment only; no sort.
- Budget: `deriveEquipmentBudgetSummary`, `maxAffordableEquipmentQuantity` (remaining-based).
- Resolver catalog: [character-builder-resolvers.md](character-builder-resolvers.md).
