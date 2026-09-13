import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'

import {
  deriveMasterDetailAvailabilityScope,
  filterMasterDetailItems,
  resolveMasterDetailPinnedRowId,
} from './master-detail-availability-filter.lib'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'

export type MasterDetailAvailabilityDerivedState<T extends MasterDetailAvailabilityPresentation> = {
  pinnedRowId: string | null
  selectedUnavailable: boolean
  isSelectedPinned: boolean
  hiddenUnavailableCount: number
  visibleItems: T[]
  scope: CampaignAvailabilityScope
  canShowHiddenUnavailable: boolean
  canHideUnavailable: boolean
}

export function deriveHiddenUnavailableCount(
  items: readonly MasterDetailAvailabilityPresentation[],
  pinnedRowId: string | null,
  showUnavailable: boolean,
): number {
  if (showUnavailable) return 0

  const unavailableCount = items.filter((item) => !item.isAvailable).length
  const pinnedUnavailable =
    pinnedRowId !== null && items.some((item) => item.rowId === pinnedRowId && !item.isAvailable)

  return unavailableCount - (pinnedUnavailable ? 1 : 0)
}

export function isMasterDetailRowVisible(
  items: readonly MasterDetailAvailabilityPresentation[],
  rowId: string | null,
  showUnavailable: boolean,
  pinnedRowId: string | null,
): boolean {
  if (!rowId) return false
  return filterMasterDetailItems(items, { showUnavailable, pinnedRowId }).some(
    (item) => item.rowId === rowId,
  )
}

export function resolveNextAvailableMasterDetailRowId(
  items: readonly MasterDetailAvailabilityPresentation[],
  selectedRowId: string,
): string | null {
  const selectedIndex = items.findIndex((item) => item.rowId === selectedRowId)
  if (selectedIndex === -1) return null

  for (let index = selectedIndex + 1; index < items.length; index += 1) {
    if (items[index]?.isAvailable) return items[index]!.rowId
  }

  for (let index = selectedIndex - 1; index >= 0; index -= 1) {
    if (items[index]?.isAvailable) return items[index]!.rowId
  }

  return null
}

/**
 * Resolves the next selected row after an explicit Hide action.
 * Returns a row id when the selected unavailable row must move; otherwise `undefined`
 * to keep the current selection (available rows, or hidden unavailable with no fallback).
 */
export function resolveMasterDetailSelectionAfterHide(
  items: readonly MasterDetailAvailabilityPresentation[],
  selectedRowId: string | null,
): string | undefined {
  if (!selectedRowId) return undefined

  const selected = items.find((item) => item.rowId === selectedRowId)
  if (!selected || selected.isAvailable) return undefined

  return resolveNextAvailableMasterDetailRowId(items, selectedRowId) ?? undefined
}

export function deriveMasterDetailAvailabilityState<T extends MasterDetailAvailabilityPresentation>(
  items: readonly T[],
  selectedRowId: string | null,
  showUnavailable: boolean,
): MasterDetailAvailabilityDerivedState<T> {
  const pinnedRowId = resolveMasterDetailPinnedRowId(items, selectedRowId, showUnavailable)
  const visibleItems = filterMasterDetailItems(items, { showUnavailable, pinnedRowId })
  const scope = deriveMasterDetailAvailabilityScope(items, showUnavailable)
  const hiddenUnavailableCount = deriveHiddenUnavailableCount(items, pinnedRowId, showUnavailable)

  const selected = selectedRowId ? items.find((item) => item.rowId === selectedRowId) : undefined
  const selectedUnavailable = Boolean(selected && !selected.isAvailable)
  const isSelectedPinned = Boolean(
    pinnedRowId && selectedRowId === pinnedRowId && selectedUnavailable && !showUnavailable,
  )

  return {
    pinnedRowId,
    selectedUnavailable,
    isSelectedPinned,
    hiddenUnavailableCount,
    visibleItems,
    scope,
    canShowHiddenUnavailable: !showUnavailable && hiddenUnavailableCount > 0,
    canHideUnavailable: showUnavailable && scope.unavailableCount > 0,
  }
}
