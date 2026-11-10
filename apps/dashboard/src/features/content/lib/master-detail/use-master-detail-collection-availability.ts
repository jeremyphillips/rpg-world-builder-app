import { useMemo } from 'react'

import { buildAvailabilityCountSupplement } from '../campaign-access/availability-count-supplement'
import { isMasterDetailRowVisible } from './master-detail-availability-state.lib'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import { useMasterDetailAvailabilityFilter } from './use-master-detail-availability-filter'

/**
 * Availability filter, combined-row counts, and Show/Hide for any master-detail
 * collection. Input is the neutral presentation row — no form binding.
 */
export function useMasterDetailCollectionAvailability<
  T extends MasterDetailAvailabilityPresentation,
>({
  items,
  selectedId,
  onSelectedIdChange,
}: {
  items: readonly T[]
  selectedId: string | null
  onSelectedIdChange?: (id: string) => void
}) {
  const filter = useMasterDetailAvailabilityFilter({
    items,
    selectedRowId: selectedId,
    onSelectedRowIdChange: onSelectedIdChange,
  })

  const isSelectedVisible = isMasterDetailRowVisible(
    items,
    selectedId,
    filter.showUnavailable,
    filter.pinnedRowId,
  )

  const countSupplement = useMemo(
    () =>
      buildAvailabilityCountSupplement({
        scope: filter.scope,
        showUnavailable: filter.showUnavailable,
        hiddenUnavailableCount: filter.hiddenUnavailableCount,
        onShow: filter.showUnavailableItems,
        onHide: filter.hideUnavailableItems,
      }),
    [
      filter.hiddenUnavailableCount,
      filter.hideUnavailableItems,
      filter.scope,
      filter.showUnavailable,
      filter.showUnavailableItems,
    ],
  )

  return {
    ...filter,
    isSelectedVisible,
    countSupplement,
  }
}
