import { useCallback, useId } from 'react'

import { CONTENT_OVERVIEW_BULK_SELECTION_LIMIT } from '../content-overview-selection.constants'
import { useContentOverviewSelection } from './use-content-overview-selection'

/** Shared bulk selection state for content overview tables — no dialog ownership. */
export function useContentOverviewBulkSelection<T extends { id: string }>(
  visibleRowIds: ReadonlySet<string>,
) {
  const selectionLiveRegionId = useId()
  const {
    selectionMode,
    rowSelection,
    selectedRows,
    selectedCount,
    selectionCapDescriptionId,
    getRowCanSelect,
    enterSelectionMode,
    exitSelectionMode,
    removeFromSelection,
    onRowSelectionChange,
    onRowSelectionStateChange,
  } = useContentOverviewSelection<T>({
    visibleRowIds,
    selectionLimit: CONTENT_OVERVIEW_BULK_SELECTION_LIMIT,
  })

  const selectionLiveRegionMessage = selectionMode
    ? `Selection mode. ${selectedCount} item${selectedCount === 1 ? '' : 's'} selected.`
    : ''

  const handleExitSelectionMode = useCallback(() => {
    exitSelectionMode()
  }, [exitSelectionMode])

  return {
    selectionLiveRegionId,
    selectionLiveRegionMessage,
    selectionLimit: CONTENT_OVERVIEW_BULK_SELECTION_LIMIT,
    selectionMode,
    rowSelection,
    selectedRows,
    selectedCount,
    selectionCapDescriptionId,
    getRowCanSelect,
    enterSelectionMode,
    handleExitSelectionMode,
    onRowSelectionChange,
    onRowSelectionStateChange,
    removeFromSelection,
  }
}
