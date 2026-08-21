# Equipment inventory (character builder)

Dashboard layout and editing rules for the Equipment step inventory. Contracts
resolvers and conversion commit logic live in `@rpg/contracts`; this doc covers
dashboard IA and how the UI composes existing row controls.

## Source groups

Inventory is split into two sections. Package-owned and purchased rows never
interleave inside the same category list while a package is selected. On `xl+`
breakpoints, the starting package card and purchased cart render side by side in
a two-column grid.

| Section                 | When shown                           | Row behavior                                                                                                                                                            |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Starting package**    | Package option selected              | `subsection` heading and Customize · Change option links sit above the bordered card; categories inside use dividers; qty 2+ shows read-only `Qty N`; no per-row remove |
| **Purchased Equipment** | Always (empty state on package path) | `subsection` heading aligned with starting package; reuses `EquipmentInventoryRowItem` cart controls for `startingGold` purchases                                       |

Gold option selected: hide the starting package card; show purchased section (with
**Browse equipment** inline on the purchased heading) and the budget block. Package
option selected: same **Browse equipment** control on the purchased heading once an
option is chosen.

## Package customization

- **Customize** and **Change option** text links sit above the package card.
  Customize swaps the card body for the starting-gold conversion editor until
  cancel or commit.
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
Line 1:  {name}  [Equipped]          {stepper}  [trash]
Line 2:  {priceLine}
```

`priceLine` comes from `formatEquipmentInventoryPriceLine` in `@rpg/contracts`
(via `buildInventoryRowPresentation`). Package-sourced rows no longer show a
`sourceLabel` on line 2; combined package rows keep breakdown copy on the
parent row only (`7 total · 5 included · 2 purchased`).

| Purchase                                                       | Controls                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Stackable `startingGold` (`origin: picker`)                    | Line 1: `NumberStepper` + Remove text; line 2: price                |
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

- **Remove** is a trash icon button, not visible text. `aria-label` still describes
  the full action (e.g. `Remove all 2 Rations`).
- Only `removeTarget.kind === 'purchase'` rows render Remove. Package grants
  clear `removeTarget` in `buildInventoryRowPresentation`.
- Combined rows: only purchased-editable sub-rows get Remove; package portions
  never do.

### NumberStepper usage

Inventory and drawer purchase panels share `@rpg/ui` `NumberStepper`:

- `size="sm"`, `bordered={true}` in cart and drawer bodies
- `digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}` (2)

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

## Package switch resolution

When the player changes starting-equipment options, retained `startingGold`
purchases may exceed the **target option's wealth allowance**. The Equipment step
opens a transactional resolution modal instead of applying the switch immediately.

### Guard order

1. Same option selected → collapse the chooser (unchanged).
2. `evaluateEquipmentPackageSwitch` reports a conflict → open the resolution modal;
   committed draft is unchanged until confirm.
3. Else if `equipment.customized` → existing customized switch confirm dialog.
4. Else → apply the selection immediately.

Resolution **supersedes** the customized confirm: the player is already explicitly
resolving inventory to switch.

### Draft model

Ephemeral state in `useEquipmentStep` (`pendingPackageSwitch`):

- `draftQuantitiesByPurchaseId` — local qty map for editable purchases only.
- `committedInventorySnapshot` — fingerprint for staleness while the modal is open.

Qty `0` means **staged for removal** (row stays visible, restorable via increment).
Trash sets draft qty to `0`; Cancel / Escape discards the draft with no
`onDraftChange`.

### Modal modes

| `evaluation.status`                 | UI                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `resolvable`                        | Budget summary + editable purchased inventory (`showGroupHeadings={false}`, `allowZeroQuantity`) + **Switch package** |
| `blocked` (`nonEditableOverBudget`) | Cost breakdown only — no steppers; **Cancel** / close only                                                            |

Confirm calls `buildEquipmentPackageSwitchPatch` with the snapshot. Stale
committed inventory rejects the patch, shows an inline alert, and rebuilds draft
quantities from the live draft.

`equipment.customized` is **preserved** on package switch (required reductions are
conflict resolution, not a new customization signal).

## Key modules

| Area                     | Path                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Layout VM                | `lib/equipment/equipment-inventory-summary.lib.ts`                                          |
| Inventory chrome CVA     | `components/equipment/inventory/equipment-inventory.variants.ts`                            |
| Package card + editor    | `components/equipment/starting-package/equipment-starting-package-*.client.tsx`             |
| Purchased rows           | `components/equipment/inventory/purchased/equipment-purchased-inventory-section.client.tsx` |
| Purchase drawer rows     | `components/equipment/picker/purchase/equipment-picker-purchase-rows.client.tsx`            |
| Purchase VM              | `components/equipment/picker/purchase/equipment-picker-purchase.lib.ts`                     |
| NumberStepper            | `packages/ui/src/components/ui/number-stepper.client.tsx`                                   |
| Step wiring              | `hooks/use-equipment-step.client.ts`                                                        |
| Package-switch modal     | `components/equipment/package-switch/equipment-package-switch-resolution-modal.*`           |
| Conversion contracts     | `packages/contracts/.../starting-package-conversion.ts`                                     |
| Package-switch contracts | `packages/contracts/.../equipment-package-switch.ts`                                        |

## Related docs

- [character-builder.md](character-builder.md)
- [packages/contracts/docs/character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md)
