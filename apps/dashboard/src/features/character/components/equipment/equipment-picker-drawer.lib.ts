import {
  canPurchaseEquipment,
  compareEquipmentPickerItemsByRecommendation,
  EQUIPMENT_PICKER_SUPPORTED_KINDS,
  formatMoney,
  formatWealthAsGold,
  isEquipmentPickerSupportedKind,
  moneyToCopper,
  type CharacterWealth,
  type EquipmentPickerBrowseSortContext,
  type EquipmentPickerSupportedKind,
  type Money,
} from '@rpg/contracts'

import { normalizeSearchQuery, scoreItem } from '@rpg/ui'

import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_NAME_DESC,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSortMode,
  type EquipmentPickerViewDefaults,
} from './equipment-picker-drawer.types'

export const EQUIPMENT_PICKER_VIEW_DEFAULTS = {
  selectedKind: EQUIPMENT_PICKER_KIND_ALL,
  showAffordableOnly: false,
  sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
} as const satisfies EquipmentPickerViewDefaults

const equipmentNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

type EquipmentPickerScoredItem = {
  item: EquipmentPickerItem
  searchScore: number
}

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
  if (!budget || item.state.purchaseAvailability.status !== 'unaffordable') {
    return undefined
  }

  if (!canPurchaseEquipment(item.equipment)) {
    return undefined
  }

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

export function hasEquipmentPickerResetViewCriteria(args: {
  selectedKind: EquipmentPickerKindFilter
  showAffordableOnly: boolean
  searchQuery: string
  sortMode: EquipmentPickerSortMode
  activeTabId: string
  defaultTabId: string
}): boolean {
  if (args.searchQuery.trim().length > 0) return true
  if (countEquipmentPickerStructuredFilters(args) > 0) return true
  if (args.sortMode !== EQUIPMENT_PICKER_SORT_BEST_MATCH) return true
  if (args.activeTabId !== args.defaultTabId) return true
  return false
}

function isEquipmentPickerItemPriced(item: EquipmentPickerItem): boolean {
  return canPurchaseEquipment(item.equipment)
}

function scoreEquipmentPickerItem(item: EquipmentPickerItem, searchQuery: string): number {
  return scoreItem({ fields: [{ text: item.searchText, weight: 1, role: 'label' }] }, searchQuery)
}

function filterEquipmentPickerItemsBySearch(
  items: readonly EquipmentPickerItem[],
  searchQuery: string,
): EquipmentPickerItem[] {
  const normalizedQuery = normalizeSearchQuery(searchQuery)
  if (!normalizedQuery) return [...items]

  return items.filter((item) => scoreEquipmentPickerItem(item, searchQuery) > 0)
}

function filterEquipmentPickerItemsForTab(
  items: readonly EquipmentPickerItem[],
  activeTabId: string,
): EquipmentPickerItem[] {
  return items.filter((item) => getEquipmentPickerItemTab(item) === activeTabId)
}

function compareEquipmentPickerItemsByPrice(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  direction: 'asc' | 'desc',
): number {
  const leftPriced = isEquipmentPickerItemPriced(left)
  const rightPriced = isEquipmentPickerItemPriced(right)

  if (canPurchaseEquipment(left.equipment) && canPurchaseEquipment(right.equipment)) {
    const diff = moneyToCopper(left.equipment.cost) - moneyToCopper(right.equipment.cost)
    return direction === 'asc' ? diff : -diff
  }

  if (leftPriced !== rightPriced) {
    return leftPriced ? -1 : 1
  }

  return 0
}

function compareScoredItemsBySearchScore(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  hasQuery: boolean,
): number {
  if (!hasQuery) return 0
  return right.searchScore - left.searchScore
}

function compareScoredItemsByRecommendationTiebreaker(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  browseSortContext?: EquipmentPickerBrowseSortContext,
): number {
  return compareEquipmentPickerItemsByRecommendation(left.item, right.item, browseSortContext)
}

function compareScoredItemsAfterPrimary(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  primaryCmp: number,
  hasQuery: boolean,
  browseSortContext?: EquipmentPickerBrowseSortContext,
): number {
  if (primaryCmp !== 0) return primaryCmp

  const scoreCmp = compareScoredItemsBySearchScore(left, right, hasQuery)
  if (scoreCmp !== 0) return scoreCmp

  return compareScoredItemsByRecommendationTiebreaker(left, right, browseSortContext)
}

function compareScoredItemsByPriceMode(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  direction: 'asc' | 'desc',
  hasQuery: boolean,
  browseSortContext?: EquipmentPickerBrowseSortContext,
): number {
  return compareScoredItemsAfterPrimary(
    left,
    right,
    compareEquipmentPickerItemsByPrice(left.item, right.item, direction),
    hasQuery,
    browseSortContext,
  )
}

function compareScoredItemsByNameMode(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  direction: 'asc' | 'desc',
  hasQuery: boolean,
  browseSortContext?: EquipmentPickerBrowseSortContext,
): number {
  const nameCmp =
    direction === 'asc'
      ? equipmentNameCollator.compare(left.item.equipment.name, right.item.equipment.name)
      : equipmentNameCollator.compare(right.item.equipment.name, left.item.equipment.name)

  return compareScoredItemsAfterPrimary(left, right, nameCmp, hasQuery, browseSortContext)
}

function compareEquipmentPickerItemsByBestMatch(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  searchQuery: string,
  browseSortContext?: EquipmentPickerBrowseSortContext,
): number {
  const hasQuery = normalizeSearchQuery(searchQuery).length > 0
  if (hasQuery) {
    const scoreDiff = right.searchScore - left.searchScore
    if (scoreDiff !== 0) return scoreDiff
  }

  return compareEquipmentPickerItemsByRecommendation(left.item, right.item, browseSortContext)
}

function compareEquipmentPickerScoredItems(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  options: {
    searchQuery: string
    sortMode: EquipmentPickerSortMode
    browseSortContext?: EquipmentPickerBrowseSortContext
  },
): number {
  const { searchQuery, sortMode, browseSortContext } = options
  const hasQuery = normalizeSearchQuery(searchQuery).length > 0

  switch (sortMode) {
    case EQUIPMENT_PICKER_SORT_BEST_MATCH:
      return compareEquipmentPickerItemsByBestMatch(left, right, searchQuery, browseSortContext)
    case EQUIPMENT_PICKER_SORT_PRICE_ASC:
      return compareScoredItemsByPriceMode(left, right, 'asc', hasQuery, browseSortContext)
    case EQUIPMENT_PICKER_SORT_PRICE_DESC:
      return compareScoredItemsByPriceMode(left, right, 'desc', hasQuery, browseSortContext)
    case EQUIPMENT_PICKER_SORT_NAME_ASC:
      return compareScoredItemsByNameMode(left, right, 'asc', hasQuery, browseSortContext)
    case EQUIPMENT_PICKER_SORT_NAME_DESC:
      return compareScoredItemsByNameMode(left, right, 'desc', hasQuery, browseSortContext)
  }
}

/** Score-once search inclusion and sort pipeline for tab-scoped equipment picker rows. */
export function filterAndSortEquipmentPickerItems(
  items: readonly EquipmentPickerItem[],
  options: {
    searchQuery: string
    sortMode: EquipmentPickerSortMode
    browseSortContext?: EquipmentPickerBrowseSortContext
  },
): EquipmentPickerItem[] {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery)
  const scored = items.map((item) => ({
    item,
    searchScore: scoreEquipmentPickerItem(item, options.searchQuery),
  }))

  const filtered = normalizedQuery ? scored.filter((row) => row.searchScore > 0) : scored

  return [...filtered]
    .sort((left, right) => compareEquipmentPickerScoredItems(left, right, options))
    .map((row) => row.item)
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
    if (
      options.filterOutUnaffordable &&
      canPurchaseEquipment(item.equipment) &&
      !item.state.isAffordable
    ) {
      return false
    }
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

/**
 * Rows hidden by Affordable now within the active tab, after search/category/starting-budget
 * filters. Informational only — not part of checkbox label or active-filter counts.
 */
export function countEquipmentPickerAffordableHiddenImpact(
  items: readonly EquipmentPickerItem[],
  options: {
    activeTabId: string
    searchQuery: string
    filterOutUnaffordable: boolean
    filterOutNonProficient: boolean
    selectedKind: EquipmentPickerKindFilter
    showAffordableOnly: boolean
  },
): number {
  if (!options.showAffordableOnly) return 0

  const tabScoped = filterEquipmentPickerItemsForTab(items, options.activeTabId)
  const searchScoped = filterEquipmentPickerItemsBySearch(tabScoped, options.searchQuery)
  const structuredFilterOptions = {
    filterOutUnaffordable: options.filterOutUnaffordable,
    filterOutNonProficient: options.filterOutNonProficient,
    selectedKind: options.selectedKind,
  }

  const beforeAffordable = filterEquipmentPickerItems(searchScoped, {
    ...structuredFilterOptions,
    showAffordableOnly: false,
  })
  const afterAffordable = filterEquipmentPickerItems(searchScoped, {
    ...structuredFilterOptions,
    showAffordableOnly: true,
  })

  const hiddenCount = beforeAffordable.length - afterAffordable.length
  return hiddenCount > 0 ? hiddenCount : 0
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
  if (item.state.disabledReasons.length > 0) return true

  const availability = item.state.purchaseAvailability
  return availability.status === 'unavailable' || availability.status === 'unaffordable'
}

export function getEquipmentPickerDisabledNote(
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): string | undefined {
  if (item.state.disabledReasons.length > 0) {
    return item.state.disabledReasons[0]
  }

  if (item.state.purchaseAvailability.status === 'unavailable') {
    return EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL
  }

  if (item.state.purchaseAvailability.status === 'unaffordable') {
    return formatEquipmentUnaffordableReason(item, budget)
  }

  return undefined
}
