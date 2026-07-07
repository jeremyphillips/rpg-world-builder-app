import {
  formatMoney,
  formatWeight,
  getArmorAcDisplay,
  getArmorCategoryLabel,
  getEquipmentKindLabel,
  formatWeaponDamage,
  formatWeaponProperties,
  formatWeaponRange,
  getWeaponCategoryLabel,
  getWeaponMasteryLabel,
  getWeaponModeLabel,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'

const SUMMARY_SEPARATOR = ' · '

export function getEquipmentPickerItemTab(item: EquipmentPickerItem): string {
  return item.state.isRecommended ? EQUIPMENT_PICKER_TAB_RECOMMENDED : EQUIPMENT_PICKER_TAB_ALL
}

export function formatEquipmentBudgetWealth(wealth: EquipmentBudgetSummary['remaining']): string {
  const parts: string[] = []
  if (wealth.pp > 0) parts.push(`${wealth.pp} PP`)
  if (wealth.gp > 0) parts.push(`${wealth.gp} GP`)
  if (wealth.sp > 0) parts.push(`${wealth.sp} SP`)
  if (wealth.cp > 0) parts.push(`${wealth.cp} CP`)
  return parts.length > 0 ? parts.join(', ') : '0 GP'
}

export function formatEquipmentUnaffordableReason(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): string {
  const need = formatMoney(item.equipment.cost)
  const have = budget ? formatEquipmentBudgetWealth(budget.remaining) : '—'
  return `Need ${need}, you have ${have}`
}

function formatOptionalWeight(equipment: Equipment): string | undefined {
  return 'weight' in equipment && equipment.weight ? formatWeight(equipment.weight) : undefined
}

function formatWeaponSummary(equipment: Extract<Equipment, { kind: 'weapon' }>): string {
  return [
    getWeaponCategoryLabel(equipment.category),
    getWeaponModeLabel(equipment.mode),
    equipment.damage ? formatWeaponDamage(equipment.damage) : undefined,
    formatWeaponProperties(equipment.properties),
    getWeaponMasteryLabel(equipment.mastery),
    formatMoney(equipment.cost),
    formatOptionalWeight(equipment),
  ]
    .filter(Boolean)
    .join(SUMMARY_SEPARATOR)
}

function formatArmorSummary(equipment: Extract<Equipment, { kind: 'armor' }>): string {
  const stealth = equipment.stealthDisadvantage ? 'Stealth disadvantage' : 'No stealth penalty'
  const strengthRequirement = equipment.strengthRequirement
    ? `Str ${equipment.strengthRequirement}`
    : undefined

  return [
    getArmorCategoryLabel(equipment.category),
    getArmorAcDisplay(equipment),
    strengthRequirement,
    stealth,
    formatMoney(equipment.cost),
    formatOptionalWeight(equipment),
  ]
    .filter(Boolean)
    .join(SUMMARY_SEPARATOR)
}

function formatGearSummary(equipment: Equipment): string {
  return [
    getEquipmentKindLabel(equipment.kind),
    formatMoney(equipment.cost),
    formatOptionalWeight(equipment),
  ]
    .filter(Boolean)
    .join(SUMMARY_SEPARATOR)
}

export function formatEquipmentPickerSummaryLine(equipment: Equipment): string {
  switch (equipment.kind) {
    case 'weapon':
      return formatWeaponSummary(equipment)
    case 'armor':
      return formatArmorSummary(equipment)
    default:
      return formatGearSummary(equipment)
  }
}

export function formatEquipmentPickerDetails(equipment: Equipment): string {
  const lines: string[] = [formatEquipmentPickerSummaryLine(equipment)]

  if (equipment.kind === 'weapon' && equipment.range) {
    lines.push(`Range: ${formatWeaponRange(equipment.range)}`)
  }

  if (equipment.description) {
    lines.push(
      equipment.description
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
  }

  return lines.filter(Boolean).join('\n')
}

export function resolveEquipmentKindFilterOptions(
  items: readonly EquipmentPickerItem[],
  allowedKinds?: readonly EquipmentKind[],
): EquipmentKind[] {
  const kindsInItems = new Set(items.map((item) => item.equipment.kind))
  const sourceKinds = allowedKinds ?? [...kindsInItems]
  return sourceKinds.filter((kind) => kindsInItems.has(kind))
}

export function filterEquipmentPickerItems(
  items: readonly EquipmentPickerItem[],
  options: {
    filterOutUnaffordable: boolean
    filterOutNonProficient: boolean
    selectedKinds: readonly EquipmentKind[]
  },
): EquipmentPickerItem[] {
  return items.filter((item) => {
    if (options.filterOutUnaffordable && !item.state.isAffordable) return false
    if (options.filterOutNonProficient && !item.state.isProficient) return false
    if (!options.selectedKinds.includes(item.equipment.kind)) return false
    return true
  })
}

export function isEquipmentPickerItemDisabled(item: EquipmentPickerItem): boolean {
  return !item.state.isAffordable || item.state.disabledReasons.length > 0
}

export function getEquipmentPickerDisabledNote(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): string | undefined {
  if (!item.state.isAffordable) {
    return formatEquipmentUnaffordableReason(item, budget)
  }

  return item.state.disabledReasons[0]
}

export function getEquipmentPickerBadgeLabel(item: EquipmentPickerItem): string | undefined {
  if (!item.state.isProficient) return EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL
  return undefined
}
