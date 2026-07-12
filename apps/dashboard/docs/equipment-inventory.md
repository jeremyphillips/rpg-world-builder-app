# Equipment inventory (character builder)

Dashboard layout and editing rules for the Equipment step inventory. Contracts
resolvers and conversion commit logic live in `@rpg/contracts`; this doc covers
dashboard IA and how the UI composes existing row controls.

## Source groups

Inventory is split into two sections. Package-owned and purchased rows never
interleave inside the same category list while a package is selected.

| Section                          | When shown                           | Row behavior                                                                                                  |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Starting Equipment**           | Package option selected              | Name + value line per row; qty 2+ shows read-only `Qty N`; Customize on package card only (no per-row remove) |
| **Purchased with Starting Gold** | Always (empty state on package path) | Reuses `EquipmentInventoryRowItem` cart controls for `startingGold` purchases                                 |

Gold option selected: hide Starting Equipment; show purchased section and
**Browse equipment** (picker).

## Package customization

- **Customize** on the package card opens the conversion editor (draft-only until
  confirm).
- **Change equipment option** scrolls to starting-equipment option cards.
- Package rows do not write `removedPackageItemKeys`; legacy keys are still read
  for session migration.

Conversion commit (`buildStartingPackageConversionPatch` in contracts):

1. Switches to the gold starting-equipment option.
2. Clears `removedPackageItemKeys`.
3. Creates purchases with `origin: 'packageConversion'`.
4. Merges **same-origin** stackable rows only (v1 does not merge across
   `origin`).

## Purchased cart (quantity surface)

Editability is owned by `resolveEquipmentPurchaseQuantityLimits` in contracts —
not ad-hoc VM rules.

### Row layout

Purchased-cart rows use a two-line layout:

```text
Line 1:  {name}  [Equipped]
Line 2:  {priceLine}          {actions}
```

`priceLine` comes from `formatEquipmentInventoryPriceLine` in `@rpg/contracts`
(via `buildInventoryRowPresentation`). Package-sourced rows no longer show a
`sourceLabel` on line 2; combined package rows keep breakdown copy on the
parent row only (`7 total · 5 included · 2 purchased`).

| Purchase                                                       | Controls                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Stackable `startingGold` (`origin: picker`)                    | Line 2: price + borderless `NumberStepper` + Remove text            |
| Non-stackable `startingGold`                                   | qty locked at 1, full-row Remove                                    |
| Converted non-stackable (`origin: packageConversion`, qty > 1) | qty locked at authored amount, full-row Remove                      |
| Legacy `manual`                                                | Locked, counts against budget; picker cannot create new manual rows |
| Package grant (any qty)                                        | Value pricing only; qty 2+ shows read-only `Qty N`; no row remove   |

### Pricing copy

Contracts normalize multi-unit totals through copper so mixed denominations
collapse correctly (e.g. `5 SP each · 1 GP total` for qty 2). Bundle and
non-stackable value lines follow the same resolver; see
`formatEquipmentInventoryPriceLine` and
`formatEquipmentPurchaseTotalPriceLabel`.

### Remove semantics

- **Remove** is a visible text button (`variant="link"` styling), not a trash
  icon. `aria-label` still describes the full action (e.g. `Remove all 2
Rations`).
- Only `removeTarget.kind === 'purchase'` rows render Remove. Package grants
  clear `removeTarget` in `buildInventoryRowPresentation`.
- Combined rows: only purchased-editable sub-rows get Remove; package portions
  never do.

### NumberStepper usage

Inventory and drawer purchase panels share `@rpg/ui` `NumberStepper`:

- `size="sm"`, `bordered={false}` in cart and drawer bodies
- `digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}` (2)
- At qty ≥ `EQUIPMENT_INVENTORY_CLICK_TO_EDIT_QUANTITY_THRESHOLD` (10), cart
  rows show a click-to-edit quantity button first; expanding reveals the
  stepper

## Picker

Gold path only. Collapsible drawer body for owned stackables:

```text
Purchase
In inventory                                    {ownedQty}
[Remove one from inventory]  or  [Remove from inventory]
Quantity to add                          [−] n [+]
────────────────────────────────────────
Unit price                                      …
Purchase total                                  …
────────────────────────────────────────
Remaining after purchase                        …
[Add another]
```

- **Remove one from inventory** — stackable, `ownedQty > 1`; decrements owned
  qty by one via `onRemoveOneFromInventory`.
- **Remove from inventory** — full remove via `onRemoveFromInventory`.
- Owned uniques show **In inventory 1** + **Remove from inventory** only (no
  quantity-to-add block).
- `maxQuantity` for owned items uses `currentQuantity: ownedQuantity` in
  `resolveEquipmentStepPurchaseMaxQuantity` (fixes prior clamp-at-1 bug).
- Header rail still shows quick **Add another** for owned stackables; bulk
  quantity is chosen in the expanded body.

## Key modules

| Area                  | Path                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| Layout VM             | `components/equipment/equipment-inventory-summary.lib.ts`               |
| Package card + editor | `components/equipment/equipment-starting-package-*.client.tsx`          |
| Purchased rows        | `components/equipment/equipment-purchased-inventory-section.client.tsx` |
| Purchase drawer rows  | `components/equipment/equipment-picker-purchase-rows.client.tsx`        |
| Purchase VM           | `components/equipment/equipment-picker-purchase.lib.ts`                 |
| NumberStepper         | `packages/ui/src/components/ui/number-stepper.client.tsx`               |
| Step wiring           | `components/steps/use-equipment-step.client.ts`                         |
| Conversion contracts  | `packages/contracts/.../starting-package-conversion.ts`                 |

## Related docs

- [character-builder.md](character-builder.md)
- [packages/contracts/docs/character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md)
