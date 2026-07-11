# Equipment inventory (character builder)

Dashboard layout and editing rules for the Equipment step inventory. Contracts
resolvers and conversion commit logic live in `@rpg/contracts`; this doc covers
dashboard IA and how the UI composes existing row controls.

## Source groups

Inventory is split into two sections. Package-owned and purchased rows never
interleave inside the same category list while a package is selected.

| Section                          | When shown                           | Row behavior                                                                                          |
| -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Starting Equipment**           | Package option selected              | One package card; quantities locked to grant values (`5 × Dagger`); Customize opens conversion editor |
| **Purchased with Starting Gold** | Always (empty state on package path) | Reuses `EquipmentInventoryRowItem` cart controls for `startingGold` purchases                         |

Gold option selected: hide Starting Equipment; show purchased section and
**Browse equipment** (picker).

## Package customization

- **Customize** on the package card opens the conversion editor (draft-only until
  confirm).
- **Remove from package** pre-deselects that item in the editor.
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

| Purchase                                                       | Controls                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Stackable `startingGold` (`origin: picker`)                    | `− / qty / +`, full-stack Remove                                    |
| Non-stackable `startingGold`                                   | qty locked at 1, full-row Remove                                    |
| Converted non-stackable (`origin: packageConversion`, qty > 1) | qty locked at authored amount, full-row Remove                      |
| Legacy `manual`                                                | Locked, counts against budget; picker cannot create new manual rows |

## Picker

Gold path only. Acquisition: **Add** / **Add another** for stackables; **Added**
for owned uniques. The legacy customize/manual picker flow is retired.

## Key modules

| Area                  | Path                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| Layout VM             | `components/equipment/equipment-inventory-summary.lib.ts`               |
| Package card + editor | `components/equipment/equipment-starting-package-*.client.tsx`          |
| Purchased rows        | `components/equipment/equipment-purchased-inventory-section.client.tsx` |
| Step wiring           | `components/steps/use-equipment-step.client.ts`                         |
| Conversion contracts  | `packages/contracts/.../starting-package-conversion.ts`                 |

## Related docs

- [character-builder.md](character-builder.md)
- [packages/contracts/docs/character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md)
