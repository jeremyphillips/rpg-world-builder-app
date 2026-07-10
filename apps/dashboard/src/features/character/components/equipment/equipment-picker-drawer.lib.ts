import {
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  formatMoney,
  formatWealthAsGold,
  isEquipmentPickerSupportedKind,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
} from './equipment-picker-drawer.types'

export function getEquipmentPickerItemTab(item: EquipmentPickerItem): string {
  return item.state.isRecommended ? EQUIPMENT_PICKER_TAB_RECOMMENDED : EQUIPMENT_PICKER_TAB_ALL
}

export function formatEquipmentUnaffordableReason(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): string {
  const need = formatMoney(item.equipment.cost)
  const have = budget ? formatWealthAsGold(budget.remaining) : '—'
  return `Need ${need}, you have ${have}`
}

export function resolveEquipmentPickerAllowedKinds(
  allowedKinds?: readonly EquipmentPickerSupportedKind[],
): EquipmentPickerSupportedKind[] {
  const sourceKinds = allowedKinds ?? EQUIPMENT_PICKER_SUPPORTED_KINDS
  return sourceKinds.filter(isEquipmentPickerSupportedKind)
}

export function resolveEquipmentKindFilterOptions(
  items: readonly EquipmentPickerItem[],
  allowedKinds?: readonly EquipmentPickerSupportedKind[],
): EquipmentPickerSupportedKind[] {
  const kindsInItems = new Set(
    items.map((item) => item.equipment.kind).filter(isEquipmentPickerSupportedKind),
  )
  return resolveEquipmentPickerAllowedKinds(allowedKinds).filter((kind) => kindsInItems.has(kind))
}

export function filterEquipmentPickerItems(
  items: readonly EquipmentPickerItem[],
  options: {
    filterOutUnaffordable: boolean
    filterOutNonProficient: boolean
    selectedKind: EquipmentPickerKindFilter
  },
): EquipmentPickerItem[] {
  return items.filter((item) => {
    if (!isEquipmentPickerSupportedKind(item.equipment.kind)) return false
    if (options.filterOutUnaffordable && !item.state.isAffordable) return false
    if (options.filterOutNonProficient && !item.state.isProficient) return false
    if (
      options.selectedKind !== EQUIPMENT_PICKER_KIND_ALL &&
      item.equipment.kind !== options.selectedKind
    ) {
      return false
    }
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
