import { formatMoney, type EquipmentKind } from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'

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
