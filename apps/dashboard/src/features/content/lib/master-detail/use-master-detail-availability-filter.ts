import { useMemo, useState } from 'react'

import {
  deriveMasterDetailAvailabilityScope,
  filterMasterDetailItems,
  resolveMasterDetailPinnedRowId,
} from './master-detail-availability-filter.lib'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'

export function useMasterDetailAvailabilityFilter<T extends MasterDetailAvailabilityPresentation>({
  items,
  selectedRowId,
}: {
  items: readonly T[]
  selectedRowId: string | null
}) {
  const [showUnavailable, setShowUnavailable] = useState(false)

  const pinnedRowId = useMemo(
    () => resolveMasterDetailPinnedRowId(items, selectedRowId, showUnavailable),
    [items, selectedRowId, showUnavailable],
  )

  const scope = useMemo(
    () => deriveMasterDetailAvailabilityScope(items, showUnavailable),
    [items, showUnavailable],
  )

  const visibleItems = useMemo(
    () => filterMasterDetailItems(items, { showUnavailable, pinnedRowId }),
    [items, pinnedRowId, showUnavailable],
  )

  return {
    showUnavailable,
    setShowUnavailable,
    pinnedRowId,
    scope,
    visibleItems,
    showUnavailableItems: () => setShowUnavailable(true),
    hideUnavailableItems: () => setShowUnavailable(false),
  }
}
