# Equipment inventory (character builder)

Dashboard layout and editing rules for the Equipment step inventory. Contracts
resolvers and conversion commit logic live in `@rpg/contracts`; this doc covers
dashboard IA and how the UI composes existing row controls.

## Pending cart after class change

A class change keeps only the player's own purchases (picker and manual rows; see
`reconcileEquipmentForClassChange` in contracts). The previous package's items are never
copied into the cart, and package-conversion rows drop. When retained purchases exist and
no starting option is selected, `resolveStartingEquipmentResolution` returns
`unresolvedWithPurchases` and the step shows a pending state:

- **Layout:** the inventory view model uses `layout: 'pending'`, so the inventory
  panel shows only **Added Equipment** (no Starting Package section). Rows show the
  source label "Pending purchase", never "Purchased".
- **Funding:** `resolveEquipmentStepFundingState` returns `unresolved`, and the guidance
  area shows a "Starting funds not set" card with the pending cost formatted by
  `formatWealth` (for example "5 SP selected"). It never shows "0 GP remaining".
- **Browse and quantities:** **Browse equipment** stays hidden until an option is selected.
  Retained rows can only be decreased or removed; contracts rejects quantity increases
  while the option is unresolved.
- **Preview rail:** Equipment shows "Starting equipment not resolved" (incomplete), never
  "Ready". The preview `equipmentSummary` stays empty until an option is selected.
- **Choosing an option:** the normal package-switch evaluation fits the cart to the new
  allowance. Starting Gold that covers the cart applies directly; an option that cannot
  cover it opens the resolution modal with selection copy ("Adjust purchases for this
  option" / "Choose option"). Cancel leaves the option unresolved with the cart intact.

## Source groups

Inventory is one bordered panel. **Added Equipment** is always first (title plus a
count badge). When a starting option is selected, a divider sits under that
section and the starting channel follows. Package-owned rows stay in the starting
section; purchased and granted rows stay in Added Equipment.

| Section              | When shown              | Row behavior                                                                                                                                                                                                                             |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Added Equipment**  | Always                  | Category eyebrows and compact row cards. Provenance and price sit in trailing `meta` beside quantity controls.                                                                                                                           |
| **Starting Package** | Package option selected | Collapsed disclosure. Header shows the distinct item count and option label, plus an overflow menu (Customize package, Change package option). Expanded rows show `N GP value`, or `N GP each · Qty N · total` when quantity is above 1. |
| **Starting Gold**    | Gold option selected    | Static header: `No package gear · {option label}`. No package rows.                                                                                                                                                                      |

**Browse equipment** stays on the step guidance, not on an inventory column heading.
When magic-item grants are available, that same panel offers **Browse magic items**,
or **Manage magic items** once no choice capacity remains.

## Package customization

- The disclosure overflow menu and the expanded **Customize** button both open
  customize mode and keep the panel expanded. Customize replaces the view body
  with grouped checkbox rows until **Cancel** or **Use starting gold**. Unchecked
  rows use the muted strike-through heading. Blocked rows stay disabled and show
  the blocking reason under the name.
- `draft.equipment.classPackage` records the package decision: `unresolved`,
  `unavailable`, `declined`, or `selected` with `intent: 'automatic' | 'explicit'`.
  Explicit selections may store sparse `entryQuantities` overrides. A missing key
  is the authored quantity; `0` drops that contribution.
- `editedSincePackageSelection` (formerly `customized`) is the builder signal that
  inventory changed after the current package selection. Quick NPC customization
  is `entryQuantities`, not this flag.
- `equipment.skipped` is builder-only. It short-circuits starting-equipment
  assembly. Quick NPC "no package" is `classPackage.state === 'declined'` (or
  `unavailable` when the class has nothing to offer) and still assembles grants,
  magic items, and purchases.
- The top-level package ChoiceSet remains the builder's selection record. Quick
  NPC seeds `classPackage` before automatic fill so a declined or explicit
  package is not replaced.

Conversion commit (`buildStartingPackageConversionPatch` in contracts):

1. Switches to the gold starting-equipment option.
2. Creates purchases with `origin: 'packageConversion'`.
3. Merges **same-origin** stackable rows only (v1 does not merge across
   `origin`).

## Purchased cart (quantity surface)

Editability is owned by `resolveEquipmentPurchaseQuantityLimits` in contracts —
not ad-hoc VM rules.

### Row layout

Purchase and provenance copy sits in the trailing cell, before the controls:

```text
{name}
{advisory, when present}     {price or provenance}  {stepper}  [trash]
```

Package rows with no controls use a value-only trailing label. Quantity 1 is
`50 GP value`. Quantity 2+ is one 14px line: `2 GP each · Qty 2 · 4 GP total`.
`priceLine` comes from `formatEquipmentInventoryPriceLine` in `@rpg/contracts`
(via `buildInventoryRowPresentation`). Combined rows keep breakdown copy in that
same trailing slot (`7 total · 5 included · 2 purchased`).

| Purchase                                                       | Controls                                                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Stackable `startingGold` (`origin: picker`)                    | `NumberStepper` (trash at qty 1 removes row); price in trailing `meta`                                    |
| Non-stackable `startingGold`                                   | qty locked at 1, full-row Remove                                                                          |
| Converted non-stackable (`origin: packageConversion`, qty > 1) | qty locked at authored amount, full-row Remove                                                            |
| Legacy `manual`                                                | Locked, counts against budget; picker cannot create new manual rows                                       |
| Package grant (any qty)                                        | Price label in the trailing cell (`N GP value`, or `N GP each · Qty N · total` when qty is 2+); no remove |

### Overlapping sources

When an Added Equipment purchase is the same item as the Starting Package or a generic grant, the stepper still edits only that purchase.

- A purchase that is the whole owned quantity renders as a plain number (`1`). When another source contributes, it renders `+N`.
- Provenance lists other sources first, then Added parts: `Package ×2 · Grant ×1 · Common choice · Purchased · 4 GP`.
- On stepper rows the purchase part is always `Purchased · {total}`. Locked quantities keep `N purchased for {total}`.
- A magic-item choice shared with a purchase states the purchase count in that line (`Common choice · Purchased ×5 · 250 GP`) and does not add a separate `Qty` chip.
- Choice copy is quantity-aware: one slot is `Common choice`; two or more are `2 Common choices`.
- A grant-only magic item uses `Release` for one choice and `Release one` when more than one choice is held.
- Trash at the minimum removes only the purchase. Package and grant contributions stay.
- The Added Equipment count counts Added contributions only. Magic-item choices (`Common choice`) are Added contributions, not other sources.
- Gold-option and pending layouts do not attach package or grant other sources.

### Deferred

The **Equipped** badge was removed from cart rows and should be reimplemented
later. `entry.equipped` is still stored on the draft.

Generic `{ kind: 'grant' }` sources have no origin (species, background, feat, or homebrew), so they render as `Grant ×N` until sources carry detailed provenance.

An `ensure` grant that a purchase already satisfies contributes 0. Removing that purchase restores the grant in derived inventory, but grant-only items stay out of the cart.

### Pricing copy

Contracts normalize multi-unit totals through copper so mixed denominations
collapse correctly (e.g. `5 SP each · 1 GP total` for qty 2). Package grants
with quantity above 1 use `2 GP each · Qty 2 · 4 GP total`. Bundle and
non-stackable value lines follow the same resolver; see
`formatEquipmentInventoryPriceLine` and
`formatEquipmentPurchaseTotalPriceLabel`.

### Remove semantics

- **Remove** uses `NumberStepper` `minAction={{ mode: 'remove', … }}`: at qty 1 the
  left control becomes trash (destructive tone on hover/focus only). `aria-label`
  still describes the full action (e.g. `Remove all 2 Rations`). Button click only —
  typed or keyboard decrement never removes the row.
- Only `removeTarget.kind === 'purchase'` rows render Remove. Package grants
  clear `removeTarget` in `buildInventoryRowPresentation`.
- Combined rows: only purchased-editable sub-rows get Remove; package portions
  never do.

### NumberStepper usage

Inventory and drawer purchase panels share `@rpg/ui` `NumberStepper`:

- Added Equipment card steppers pass `size="sm"` (32px). Drawer purchase panels omit `size` and stay **md (36px)**. Both use `bordered={true}`.
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

## Proficiency and ability-score warnings

Full Builder and Quick NPC share the equipment advisories (`equipment_not_proficient` and `equipment_ability_score_requirement_unmet`) and the equipment-id index. Advisories are the final-loadout channel: Review, the create dialog, and finalize read them as aggregate lists.

The ability-score advisory fires for owned or purchased equipment whose `abilityScoreRequirements` exceed the draft's known scores (`Plate Armor — Requires STR 15; character has STR 12.`). Like proficiency, it is non-blocking: create asks for confirmation.

Builder rows do not render advisories. Picker, inventory, Starting Package, conversion, and trim rows show the short compatibility badges (`Not proficient`, `Requires STR 15`) from context-filtered row facts through the selection-row pipeline ([picker chrome](./character-builder-picker-chrome.md#builder-equipment-surfaces)). Inventory view-model rows carry `selectionPresentation`, and each parent section resolves `status` with its context, so rows never resolve proficiency while rendering. A parity test keeps row compatibility and advisories in step. Quick NPC rows still use `buildAdvisoryStatusItems` until Gate C.

Pending explicit purchases can produce an advisory before a starting option funds them; they stay out of resolved inventory. Equipment `grants` (ensure-at-least materialization) also raise advisories but render no row of their own.

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

| Area                          | Path                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Layout VM                     | `lib/equipment/equipment-inventory-summary.lib.ts`                                              |
| Inventory chrome CVA          | `components/equipment/inventory/equipment-inventory.variants.ts`                                |
| Starting package disclosure   | `components/equipment/starting-package/equipment-starting-package-disclosure.tsx`               |
| Package conversion editor     | `components/equipment/package-switch/equipment-package-conversion-editor.tsx`                   |
| Purchased rows                | `components/equipment/inventory/purchased/equipment-purchased-inventory-section.tsx`            |
| Purchase drawer rows          | `components/equipment/picker/purchase/equipment-picker-purchase-rows.tsx`                       |
| Purchase VM                   | `components/equipment/picker/purchase/equipment-picker-purchase.lib.ts`                         |
| NumberStepper                 | `packages/ui/src/components/ui/number-stepper.client.tsx`                                       |
| Step wiring                   | `hooks/use-equipment-step.ts`                                                                   |
| Package-switch modal          | `components/builder/steps/equipment/package-switch/equipment-package-switch-resolution-modal.*` |
| Package-switch resolution lib | `lib/equipment/equipment-package-switch-resolution.lib.ts`                                      |
| Row selection facts           | `lib/equipment/equipment-selection-facts.lib.ts`                                                |
| Conversion contracts          | `packages/contracts/.../starting-package-conversion.ts`                                         |
| Package-switch contracts      | `packages/contracts/.../equipment-package-switch.ts`                                            |

## Related docs

- [character-builder.md](character-builder.md)
- [packages/contracts/docs/character-builder-resolvers.md](../../../packages/contracts/docs/character-builder-resolvers.md)
