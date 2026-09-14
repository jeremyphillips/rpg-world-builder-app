import { useCallback, useMemo, useState } from 'react'

import {
  deriveMasterDetailAvailabilityState,
  resolveMasterDetailSelectionAfterHide,
} from './master-detail-availability-state.lib'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'

export function useMasterDetailAvailabilityFilter<T extends MasterDetailAvailabilityPresentation>({
  items,
  selectedRowId,
  onSelectedRowIdChange,
}: {
  items: readonly T[]
  selectedRowId: string | null
  /** Called when an explicit Hide action moves selection off an unavailable row. */
  onSelectedRowIdChange?: (rowId: string) => void
}) {
  const [showUnavailable, setShowUnavailable] = useState(false)

  const state = useMemo(
    () => deriveMasterDetailAvailabilityState(items, selectedRowId, showUnavailable),
    [items, selectedRowId, showUnavailable],
  )

  const showUnavailableItems = useCallback(() => {
    setShowUnavailable(true)
  }, [])

  const hideUnavailableItems = useCallback(() => {
    const nextSelectedRowId = resolveMasterDetailSelectionAfterHide(items, selectedRowId)
    if (nextSelectedRowId) {
      onSelectedRowIdChange?.(nextSelectedRowId)
    }
    setShowUnavailable(false)
  }, [items, onSelectedRowIdChange, selectedRowId])

  return {
    showUnavailable,
    ...state,
    showUnavailableItems,
    hideUnavailableItems,
  }
}
