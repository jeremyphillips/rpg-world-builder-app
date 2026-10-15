# Equipment filtering — surface vocabulary

Equipment appears in three **distinct filter stacks**. Names must encode the stack so “filter values” is never ambiguous.

## Surfaces (audit summary)

| Surface                        | UI stack                                                    | Typical modules                                                                                                                                                                                                                                                                                            | Filter state / config                                                                                                                                                                  | How rows are matched                                                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Form combobox panel**        | `@rpg/ui/form` — `filterSelects` toolbar on combobox fields | [`resolve-equipment-grant-filter-dimensions.lib.ts`](../src/lib/equipment/resolve-equipment-grant-filter-dimensions.lib.ts), [`content-field-option.lib.ts`](../src/features/content/lib/form-options/content-field-option.lib.ts), [`grant-sets/*-combobox-filters.lib.ts`](../src/lib/forms/grant-sets/) | Per-field `ComboboxFilterDimensionConfig[]`; active toolbar state is `FilterDimensionValue` per `filterKey`                                                                            | `filterComboboxOptionsByActiveFilters` — AND across active dimensions; each option’s **`FieldOption.filterValues`** must use the same `filterKey` strings                                         |
| **Content overview table**     | `@rpg/ui/filters` — `FilterSchema` on list routes           | e.g. [`weapon-overview-columns.tsx`](../src/features/content/equipment/weapons/lib/weapon-overview-columns.tsx), [`content-overview-filter-schema.ts`](../src/features/content/lib/overview/content-overview-filter-schema.ts)                                                                             | e.g. `WeaponOverviewFilterState` (name, source, status, category, mastery, …)                                                                                                          | Column `getValue` / `filterFn` on table rows — **not** `FieldOption.filterValues`                                                                                                                 |
| **Character equipment picker** | `@rpg/ui/filters` popover + picker controller               | [`equipment-picker-filter-schema.ts`](../src/features/character/components/equipment/picker/browse/equipment-picker-filter-schema.ts), [`equipment-picker-detail-filters.lib.ts`](../src/features/character/components/equipment/picker/browse/equipment-picker-detail-filters.lib.ts)                     | `EquipmentPickerFilterState` (kind, rarity, affordable, hide-non-proficient, …) + **`EquipmentPickerWeaponDetailFilters` / `EquipmentPickerArmorDetailFilters`** (popover chip groups) | `matchesEquipmentPickerWeaponDetailFilters` / `matchesEquipmentPickerArmorDetailFilters` — may use **picker UI tokens** (e.g. `no-stealth-disadvantage`) that differ from combobox metadata slugs |

Picker **primary** filters (kind, rarity, affordable, proficiency visibility) and overview **campaign/source** filters are out of scope for equipment combobox metadata SSOT.

## Naming migration tiers (execution)

| Tier  | Stack                                                                                                                      | Status       |
| ----- | -------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **1** | Shared **`resolveEquipmentGrantFilterDimensions`** + **`resolveEquipmentComboboxFilterValues`** + `*_COMBOBOX_FILTER_KEYS` | Done (PR 0n) |
| **2** | `reference*ComboboxFieldOptions`, `buildToolProficiencyComboboxFilters`, **`equipmentProficiencyGrantComboboxConfig`**     | Done (PR 0n) |
| **3** | Picker detail filter types/functions rename                                                                                | Done         |
| **4** | Overview `*FilterSchema` → `*OverviewFilterSchema`                                                                         | Done (PR 0n) |

## Do not confuse with

- **`ComboboxFieldOption.metadata`** in `@rpg/ui/form` — display description mapped from `FieldOption.description`, not equipment combobox dimension slugs.
- **`EquipmentDetailMetadata`** — content equipment detail page / picker collapsible stats, not filter state.

## Naming convention

| Concept                                                        | Name                                                                                                                                         | Do not use                                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Normalized weapon/armor/tool dimension slugs (shared domain)   | **`EquipmentGrantFilterDimensions`**; **`resolveEquipmentGrantFilterDimensions(equipment)`**                                                 | Generic “equipment filter values” without stack                                |
| Form combobox `FieldOption.filterValues`                       | **`resolveEquipmentComboboxFilterValues`** — thin adapter over grant dimensions                                                              | Using combobox-only name for picker matching                                   |
| Form field property on each option (fixed by `@rpg/ui/form`)   | **`filterValues`** on `FieldOption`                                                                                                          | Renaming the form API property                                                 |
| Toolbar dimension definitions for proficiency grant comboboxes | **`buildWeaponProficiencyGrantComboboxFilters`**, **`buildArmorProficiencyGrantComboboxFilters`**, **`buildToolProficiencyComboboxFilters`** | Generic `buildEquipmentFilters`                                                |
| Combobox filter key constants                                  | **`WEAPON_PROFICIENCY_COMBOBOX_FILTER_KEYS`**, **`ARMOR_PROFICIENCY_COMBOBOX_FILTER_KEYS`**, **`TOOL_PROFICIENCY_COMBOBOX_FILTER_KEYS`**     | Unqualified `*_FILTER_KEYS`                                                    |
| Reference option lists that include combobox metadata          | **`referenceWeaponComboboxFieldOptions`**, **`referenceArmorComboboxFieldOptions`**, **`referenceToolComboboxFieldOptions`**                 | Raw `toSortedContentFieldOptions` when the target combobox has `filterSelects` |
| Bundled grant combobox wiring                                  | **`equipmentProficiencyGrantComboboxConfig(selectors, 'weapon' \| 'armor' \| 'tool')`**                                                      | Split `itemOptions` + `filterSelects` without shared helper                    |
| Picker popover weapon/armor chip state                         | **`EquipmentPickerWeaponDetailFilters`**, **`EquipmentPickerArmorDetailFilters`**                                                            | “Combobox filter values”                                                       |
| Overview table weapon list filters                             | **`weaponOverviewFilterSchema`**, **`WeaponOverviewFilterState`**, …                                                                         | `weaponFilterSchema`                                                           |

## Combobox metadata slugs (weapon / armor / tool)

Canonical keys for **`resolveEquipmentComboboxFilterValues`** — must match grant-set `filterKey` values and [`field-types.md`](../../../packages/ui/docs/forms/field-types.md) panel filter docs:

| Kind   | Keys                  | Source fields                                                                             |
| ------ | --------------------- | ----------------------------------------------------------------------------------------- |
| Weapon | `category`, `mode`    | `WeaponEquipment.category`, `.mode`                                                       |
| Armor  | `category`, `stealth` | `ArmorEquipment.category`; `stealth`: `none` \| `disadvantage` from `stealthDisadvantage` |
| Tool   | `category`            | `toolCategory`                                                                            |

Picker armor stealth may use token `no-stealth-disadvantage` in **`EquipmentPickerArmorDetailFilters`**; map to grant dimension slug `stealth: 'none'` at match time via **`resolveEquipmentGrantFilterDimensions`** (see [`equipment-picker-detail-filters.lib.ts`](../src/features/character/components/equipment/picker/browse/equipment-picker-detail-filters.lib.ts)).

## Consumer invariant

Any combobox field with **`filterSelects`** (or grant-set factory that injects them) must receive options from **`reference*ComboboxFieldOptions`** or **`equipmentProficiencyGrantComboboxConfig`**. Never pair grant-set combobox filters with plain `toSortedContentFieldOptions` on equipment.
