import {
  compareEquipmentPickerItemsByRecommendation,
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  formatMoney,
  formatWealthAsGold,
  isEquipmentPickerSupportedKind,
  type EquipmentPickerBrowseSortContext,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_CLASS_TOOL_LABEL,
  EQUIPMENT_PICKER_ESSENTIAL_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentBudgetSummary,
  type EquipmentPickerBadge,
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

/** Stable within-tab ordering: essential → strong → compatible → neutral → not proficient. */
export function sortEquipmentPickerItems(
  items: readonly EquipmentPickerItem[],
  browseSortContext?: EquipmentPickerBrowseSortContext,
): EquipmentPickerItem[] {
  return [...items].sort((left, right) =>
    compareEquipmentPickerItemsByRecommendation(left, right, browseSortContext),
  )
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

/**
 * Sparse single-badge policy: the not-proficient warning wins; otherwise only
 * essential/strong rows earn a badge (proficiency alone is sort-only signal).
 */
export function getEquipmentPickerBadge(
  item: EquipmentPickerItem,
): EquipmentPickerBadge | undefined {
  if (!item.state.isProficient) {
    return { label: EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL, emphasis: 'warning' }
  }

  const { tier, reasons, label } = item.state.recommendation
  if (label) return { label, emphasis: 'highlight' }

  if (tier === 'essential') {
    if (reasons.includes('spellcastingFocus')) {
      return { label: EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL, emphasis: 'highlight' }
    }
    if (reasons.includes('classToolNeed')) {
      return { label: EQUIPMENT_PICKER_CLASS_TOOL_LABEL, emphasis: 'highlight' }
    }
    return { label: EQUIPMENT_PICKER_ESSENTIAL_LABEL, emphasis: 'highlight' }
  }

  if (tier === 'strong' && reasons.includes('startingEquipment')) {
    return { label: EQUIPMENT_PICKER_STARTING_OPTION_LABEL, emphasis: 'highlight' }
  }

  return undefined
}
