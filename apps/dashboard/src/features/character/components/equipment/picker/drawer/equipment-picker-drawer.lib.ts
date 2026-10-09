import {
  canPurchaseEquipment,
  compareEquipmentPickerItemsByRecommendation,
  formatInlineWealth,
  formatMoney,
  isEquipmentPickerSupportedKind,
  maxAffordableEquipmentQuantity,
  moneyToCopper,
  resolveMagicItemAcquiredCopyCap,
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  type CharacterWealth,
  type EquipmentPickerBrowseSortContext,
  type MagicItemGrantProgress,
  type Money,
} from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import { matchSearchDocumentQuery, normalizeSearchQuery } from '@rpg/search'
import { chainComparators, compareNumberDescending, type Comparator } from '@rpg/search/ranking'

import { pickerNameCollator } from '@/lib/catalog-picker/compare-picker-name'
import { buildEquipmentPickerRowViewModel } from '@/features/content'

import { type EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import {
  resolveEquipmentPickerPurchaseActionState,
  type EquipmentPickerAvailabilityOptions,
} from '../../../../lib/equipment/equipment-picker-availability.lib'
import {
  compareName,
  scoreAndFilterPickerItems,
} from '../../../picker/sort/catalog-picker-sort.lib'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import type { EquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'
import {
  resolveEquipmentPickerItemPresentation,
  type EquipmentPickerItemPresentation,
} from '../browse/equipment-picker-item-header.lib'
import {
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_NAME_DESC,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
  type EquipmentPickerRow,
  type EquipmentPickerSortMode,
  type EquipmentPickerViewDefaults,
} from './equipment-picker-drawer.types'

export const EQUIPMENT_PICKER_VIEW_DEFAULTS = {
  selectedKind: EQUIPMENT_PICKER_KIND_ALL,
  showAffordableOnly: false,
  sortMode: EQUIPMENT_PICKER_SORT_BEST_MATCH,
} as const satisfies EquipmentPickerViewDefaults

type EquipmentPickerScoredItem = {
  item: EquipmentPickerRow
  searchScore: number
}

export type EquipmentUnaffordableAmounts = {
  required: Money
  remaining: CharacterWealth
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
  const have = formatInlineWealth(amounts.remaining)
  return joinInlineMetadata([`${need} needed`, `${have} remaining`])
}

function isEquipmentPickerItemPriced(item: EquipmentPickerItem): boolean {
  return canPurchaseEquipment(item.equipment)
}

function scoreEquipmentPickerItem(item: EquipmentPickerRow, searchQuery: string): number {
  return (
    matchSearchDocumentQuery(item.searchDocument, searchQuery, { profile: 'forgiving' }).score ?? 0
  )
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
  return compareNumberDescending(left.searchScore, right.searchScore)
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

  return chainComparators<EquipmentPickerScoredItem>(
    (l, r) => compareScoredItemsBySearchScore(l, r, hasQuery),
    (l, r) => compareScoredItemsByRecommendationTiebreaker(l, r, browseSortContext),
  )(left, right)
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
  const nameCmp = compareName(
    pickerNameCollator,
    left.item.equipment.name,
    right.item.equipment.name,
    direction,
  )

  return compareScoredItemsAfterPrimary(left, right, nameCmp, hasQuery, browseSortContext)
}

export function compareEquipmentBestMatch(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  options: {
    searchQuery: string
    browseSortContext?: EquipmentPickerBrowseSortContext
  },
): number {
  const hasQuery = normalizeSearchQuery(options.searchQuery).text.length > 0
  const comparators: Comparator<EquipmentPickerScoredItem>[] = []

  if (hasQuery) {
    comparators.push((l, r) => compareNumberDescending(l.searchScore, r.searchScore))
  }

  comparators.push((l, r) =>
    compareEquipmentPickerItemsByRecommendation(l.item, r.item, options.browseSortContext),
  )

  return chainComparators(...comparators)(left, right)
}

function compareEquipmentPickerItemsByBestMatch(
  left: EquipmentPickerScoredItem,
  right: EquipmentPickerScoredItem,
  options: {
    searchQuery: string
    browseSortContext?: EquipmentPickerBrowseSortContext
  },
): number {
  return compareEquipmentBestMatch(left, right, options)
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
  const hasQuery = normalizeSearchQuery(searchQuery).text.length > 0

  switch (sortMode) {
    case EQUIPMENT_PICKER_SORT_BEST_MATCH:
      return compareEquipmentPickerItemsByBestMatch(left, right, {
        searchQuery,
        browseSortContext,
      })
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
export function filterAndSortEquipmentPickerItems<T extends EquipmentPickerRow>(
  items: readonly T[],
  options: {
    searchQuery: string
    sortMode: EquipmentPickerSortMode
    browseSortContext?: EquipmentPickerBrowseSortContext
  },
): T[] {
  const filtered = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreEquipmentPickerItem,
  })

  return [...filtered]
    .sort((left, right) => compareEquipmentPickerScoredItems(left, right, options))
    .map((row) => row.item)
}

export { getEquipmentPickerSearchText } from '../../../../lib/equipment/equipment-picker-search.lib'

export {
  resolveEquipmentKindFilterOptions,
  resolveEquipmentPickerAllowedKinds,
} from '../../../../lib/equipment/equipment-kind-filter.lib'

/** Drops kinds the equipment picker cannot browse. Budget and user filters stay elsewhere. */
export function filterEligibleEquipmentPickerItems<T extends EquipmentPickerItem>(
  items: readonly T[],
): T[] {
  return items.filter((item) => isEquipmentPickerSupportedKind(item.equipment.kind))
}

/** Best-match order from resolved equipment facts. */
export function sortEquipmentPickerItems<T extends EquipmentPickerItem>(
  items: readonly T[],
  browseSortContext?: EquipmentPickerBrowseSortContext,
): T[] {
  return [...items].sort((left, right) =>
    compareEquipmentPickerItemsByRecommendation(left, right, browseSortContext),
  )
}

export function isEquipmentPickerItemDisabled(
  item: EquipmentPickerItem,
  options?: EquipmentPickerAvailabilityOptions,
): boolean {
  return resolveEquipmentPickerPurchaseActionState(item, options).disabled
}

/** Aggregate ceiling for the purchase stepper: structural cap ∧ what the purse still covers. */
export function resolveMaxPurchaseAggregate(args: {
  equipment: EquipmentPickerItem['equipment']
  ownership: EquipmentOwnership
  budget?: EquipmentBudgetSummary
}): number {
  const purchased = args.ownership.editablePurchased.quantity
  if (!canPurchaseEquipment(args.equipment)) return purchased

  const structuralMax = EQUIPMENT_PURCHASE_QUANTITY_MAX - args.ownership.lockedPurchased.quantity
  if (!args.budget) return Math.max(purchased, structuralMax)

  return Math.min(
    structuralMax,
    maxAffordableEquipmentQuantity(args.equipment, args.budget, purchased),
  )
}

export function resolveEquipmentPickerDrawerItemHeaderPresentation(args: {
  item: EquipmentPickerItem
  workflowMode: EquipmentPickerWorkflowMode
  ownership: EquipmentOwnership
  rowActionVm?: EquipmentPickerRowActionViewModel
  budget?: EquipmentBudgetSummary
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
}): EquipmentPickerItemPresentation {
  const row = buildEquipmentPickerRowViewModel(args.item.equipment)
  const copyCap = resolveMagicItemAcquiredCopyCap({
    equipment: args.item.equipment,
    acquiredQuantity: args.ownership.acquiredQuantity,
  })

  const rowActionVm =
    args.rowActionVm ??
    (args.workflowMode === 'purchase'
      ? ({
          kind: 'purchase',
          disabled: resolveEquipmentPickerPurchaseActionState(args.item, {
            budget: args.budget,
            contentAvailable: true,
          }).disabled,
          availability: args.item.state.purchaseAvailability,
        } satisfies EquipmentPickerRowActionViewModel)
      : undefined)

  if (!rowActionVm) {
    return {
      control: { kind: 'none' },
      provenance: [],
      selectionState: null,
    }
  }

  return resolveEquipmentPickerItemPresentation({
    equipment: args.item.equipment,
    row,
    workflowMode: args.workflowMode,
    rowActionVm,
    ownership: args.ownership,
    ...(copyCap ? { copyCap } : {}),
    maxPurchaseQuantity: resolveMaxPurchaseAggregate({
      equipment: args.item.equipment,
      ownership: args.ownership,
      ...(args.budget ? { budget: args.budget } : {}),
    }),
    ...(args.magicItemGrantProgress ? { magicItemGrantProgress: args.magicItemGrantProgress } : {}),
    exceedsPurchaseBudgetCeiling: args.item.state.exceedsPurchaseBudgetCeiling,
  })
}
