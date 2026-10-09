import {
  getArmorCategoryLabel,
  getWeaponCategoryLabel,
  getWeaponModeLabel,
  getWeaponPropertyLabel,
  type EquipmentPickerItem,
  joinInlineMetadata,
} from '@rpg/contracts'

export const EQUIPMENT_PICKER_HIDE_NON_PROFICIENT_LABEL = 'Hide non-proficient'
export const EQUIPMENT_PICKER_WEAPON_FILTER_LABEL = 'Weapon'
export const EQUIPMENT_PICKER_ARMOR_FILTER_LABEL = 'Armor'
export const EQUIPMENT_PICKER_HIDE_UNMET_STRENGTH_LABEL = 'Hide unmet Strength'
export const EQUIPMENT_PICKER_NO_STEALTH_DISADVANTAGE_LABEL = 'No stealth disadvantage'

const WEAPON_FILTER_PROPERTIES = [
  'finesse',
  'light',
  'heavy',
  'two-handed',
  'versatile',
  'thrown',
  'reach',
  'ammunition',
] as const

export type EquipmentWeaponDetailFilters = {
  categories: string[]
  modes: string[]
  properties: string[]
}

export type EquipmentArmorDetailFilters = {
  categories: string[]
  stealth: string[]
  strength: string[]
}

export const EMPTY_WEAPON_DETAIL_FILTERS: EquipmentWeaponDetailFilters = {
  categories: [],
  modes: [],
  properties: [],
}

export const EMPTY_ARMOR_DETAIL_FILTERS: EquipmentArmorDetailFilters = {
  categories: [],
  stealth: [],
  strength: [],
}

export function equipmentPickerProficiency(item: EquipmentPickerItem): boolean | undefined {
  return item.state.resolved?.state.compatibility?.proficient
}

export function equipmentPickerKeepsNonProficientHidden(item: EquipmentPickerItem): boolean {
  return equipmentPickerProficiency(item) !== false
}

export function equipmentPickerHasUnmetStrength(item: EquipmentPickerItem): boolean {
  const unmet = item.state.resolved?.state.compatibility?.unmetAbilityScoreRequirements
  return Array.isArray(unmet) && unmet.length > 0
}

function weaponOf(item: EquipmentPickerItem) {
  return item.equipment.kind === 'weapon' ? item.equipment : undefined
}

function armorOf(item: EquipmentPickerItem) {
  return item.equipment.kind === 'armor' ? item.equipment : undefined
}

function optionSplitsRows(
  rows: readonly EquipmentPickerItem[],
  matches: (item: EquipmentPickerItem) => boolean,
): boolean {
  let kept = 0
  let hidden = 0
  for (const row of rows) {
    if (matches(row)) kept += 1
    else hidden += 1
    if (kept > 0 && hidden > 0) return true
  }
  return false
}

export function shouldShowHideNonProficientFilter(items: readonly EquipmentPickerItem[]): boolean {
  return optionSplitsRows(items, equipmentPickerKeepsNonProficientHidden)
}

export function weaponDetailFilterGroups(items: readonly EquipmentPickerItem[]) {
  const weapons = items.filter((item) => weaponOf(item))
  const categories = ['simple', 'martial'].filter((value) =>
    optionSplitsRows(weapons, (item) => weaponOf(item)?.category === value),
  )
  const modes = ['melee', 'ranged'].filter((value) =>
    optionSplitsRows(weapons, (item) => weaponOf(item)?.mode === value),
  )
  const properties = WEAPON_FILTER_PROPERTIES.filter((value) =>
    optionSplitsRows(weapons, (item) => weaponOf(item)?.properties.includes(value) ?? false),
  )

  return [
    categories.length > 0
      ? {
          id: 'categories',
          label: 'Category',
          options: categories.map((value) => ({ value, label: getWeaponCategoryLabel(value) })),
        }
      : null,
    modes.length > 0
      ? {
          id: 'modes',
          label: 'Mode',
          options: modes.map((value) => ({ value, label: getWeaponModeLabel(value) })),
        }
      : null,
    properties.length > 0
      ? {
          id: 'properties',
          label: 'Properties',
          options: properties.map((value) => ({ value, label: getWeaponPropertyLabel(value) })),
        }
      : null,
  ].filter((group) => group !== null)
}

export function armorDetailFilterGroups(items: readonly EquipmentPickerItem[]) {
  const armor = items.filter((item) => armorOf(item))
  const categories = ['light', 'medium', 'heavy', 'shields'].filter((value) =>
    optionSplitsRows(armor, (item) => armorOf(item)?.category === value),
  )
  const groups = []
  if (categories.length > 0) {
    groups.push({
      id: 'categories',
      label: 'Category',
      options: categories.map((value) => ({ value, label: getArmorCategoryLabel(value) })),
    })
  }
  if (optionSplitsRows(armor, (item) => armorOf(item)?.stealthDisadvantage === false)) {
    groups.push({
      id: 'stealth',
      label: 'Stealth',
      options: [
        { value: 'no-stealth-disadvantage', label: EQUIPMENT_PICKER_NO_STEALTH_DISADVANTAGE_LABEL },
      ],
    })
  }
  if (optionSplitsRows(armor, (item) => !equipmentPickerHasUnmetStrength(item))) {
    groups.push({
      id: 'strength',
      label: 'Strength',
      options: [
        { value: 'hide-unmet-strength', label: EQUIPMENT_PICKER_HIDE_UNMET_STRENGTH_LABEL },
      ],
    })
  }
  return groups
}

function selectedIncludes(selected: readonly string[], value: string | undefined): boolean {
  return selected.length === 0 || (value !== undefined && selected.includes(value))
}

export function matchesWeaponDetailFilters(
  item: EquipmentPickerItem,
  filters: EquipmentWeaponDetailFilters,
): boolean {
  const weapon = weaponOf(item)
  if (!weapon) return true
  if (!selectedIncludes(filters.categories, weapon.category)) return false
  if (!selectedIncludes(filters.modes, weapon.mode)) return false
  if (
    filters.properties.length > 0 &&
    !filters.properties.some((property) => weapon.properties.includes(property as never))
  ) {
    return false
  }
  return true
}

export function matchesArmorDetailFilters(
  item: EquipmentPickerItem,
  filters: EquipmentArmorDetailFilters,
): boolean {
  const armor = armorOf(item)
  if (!armor) return true
  if (!selectedIncludes(filters.categories, armor.category)) return false
  if (filters.stealth.includes('no-stealth-disadvantage') && armor.stealthDisadvantage) return false
  if (filters.strength.includes('hide-unmet-strength') && equipmentPickerHasUnmetStrength(item)) {
    return false
  }
  return true
}

export function weaponDetailFiltersActive(filters: EquipmentWeaponDetailFilters): boolean {
  return filters.categories.length + filters.modes.length + filters.properties.length > 0
}

export function armorDetailFiltersActive(filters: EquipmentArmorDetailFilters): boolean {
  return filters.categories.length + filters.stealth.length + filters.strength.length > 0
}

export function formatEquipmentDetailFilterTriggerLabel(
  label: string,
  activeCount: number,
): string {
  if (activeCount === 0) return label
  return joinInlineMetadata([label, String(activeCount)])
}

export function countWeaponDetailFilters(filters: EquipmentWeaponDetailFilters): number {
  return filters.categories.length + filters.modes.length + filters.properties.length
}

export function countArmorDetailFilters(filters: EquipmentArmorDetailFilters): number {
  return filters.categories.length + filters.stealth.length + filters.strength.length
}
