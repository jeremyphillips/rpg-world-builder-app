import {
  compareEquipmentPickerItemsByRecommendation,
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  formatMoney,
  formatWealthAsGold,
  isEquipmentPickerSupportedKind,
  type CharacterWealth,
  type EquipmentPickerBrowseSortContext,
  type EquipmentPickerSupportedKind,
  type Money,
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

export type EquipmentUnaffordableAmounts = {
  required: Money
  remaining: CharacterWealth
}

export function getEquipmentPickerItemTab(item: EquipmentPickerItem): string {
  return item.state.isRecommended ? EQUIPMENT_PICKER_TAB_RECOMMENDED : EQUIPMENT_PICKER_TAB_ALL
}

export function getEquipmentUnaffordableAmounts(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): EquipmentUnaffordableAmounts | undefined {
  if (!budget || item.state.isWithinRemainingBudget) return undefined

  return {
    required: item.equipment.cost,
    remaining: budget.remaining,
  }
}

export function formatEquipmentUnaffordableReason(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): string {
  const amounts = getEquipmentUnaffordableAmounts(item, budget)
  if (!amounts) return ''

  const need = formatMoney(amounts.required)
  const have = formatWealthAsGold(amounts.remaining)
  return `${need} needed · ${have} remaining`
}

/** Structured filters only — category + affordable toggle. Excludes search. */
export function countEquipmentPickerStructuredFilters(args: {
  selectedKind: EquipmentPickerKindFilter
  showAffordableOnly: boolean
}): number {
  let count = 0
  if (args.selectedKind !== EQUIPMENT_PICKER_KIND_ALL) count += 1
  if (args.showAffordableOnly) count += 1
  return count
}

/** Total clearable criteria — structured filters + non-empty search. */
export function countEquipmentPickerClearableCriteria(args: {
  selectedKind: EquipmentPickerKindFilter
  showAffordableOnly: boolean
  searchQuery: string
}): number {
  return countEquipmentPickerStructuredFilters(args) + Number(args.searchQuery.trim().length > 0)
}

export function hasEquipmentPickerClearableCriteria(count: number): boolean {
  return count > 0
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
    showAffordableOnly?: boolean
  },
): EquipmentPickerItem[] {
  return items.filter((item) => {
    if (!isEquipmentPickerSupportedKind(item.equipment.kind)) return false
    if (options.filterOutUnaffordable && !item.state.isAffordable) return false
    if (options.filterOutNonProficient && !item.state.isProficient) return false
    if (options.showAffordableOnly && !item.state.isWithinRemainingBudget) return false
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
  return item.state.disabledReasons.length > 0 || !item.state.isWithinRemainingBudget
}

export function getEquipmentPickerDisabledNote(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): string | undefined {
  if (item.state.disabledReasons.length > 0) {
    return item.state.disabledReasons[0]
  }

  if (!item.state.isWithinRemainingBudget) {
    return formatEquipmentUnaffordableReason(item, budget)
  }

  return undefined
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
