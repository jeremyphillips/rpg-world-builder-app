import { useCallback, useId, useState } from 'react'

import { useOverviewSelection } from '@/lib/data-table/use-overview-selection'

export const NPC_OVERVIEW_BULK_SELECTION_LIMIT = 50

export function useNpcOverviewBulkRoster<T extends { id: string }>(
  visibleRowIds: ReadonlySet<string>,
) {
  const selectionLiveRegionId = useId()
  const [bulkRosterOpen, setBulkRosterOpen] = useState(false)
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
  } = useOverviewSelection<T>({
    visibleRowIds,
    selectionLimit: NPC_OVERVIEW_BULK_SELECTION_LIMIT,
  })

  const selectionLiveRegionMessage = selectionMode
    ? `Selection mode. ${selectedCount} NPC${selectedCount === 1 ? '' : 's'} selected.`
    : ''

  const handleBulkApplyComplete = useCallback(
    (result: { updatedIds: string[]; fullSuccess: boolean }) => {
      removeFromSelection(result.updatedIds)

      if (result.fullSuccess) {
        setBulkRosterOpen(false)
        exitSelectionMode()
      }
    },
    [exitSelectionMode, removeFromSelection],
  )

  const handleExitSelectionMode = useCallback(() => {
    setBulkRosterOpen(false)
    exitSelectionMode()
  }, [exitSelectionMode])

  const openBulkRosterDialog = useCallback(() => {
    setBulkRosterOpen(true)
  }, [])

  return {
    bulkRosterOpen,
    setBulkRosterOpen,
    selectionLiveRegionId,
    selectionLiveRegionMessage,
    selectionLimit: NPC_OVERVIEW_BULK_SELECTION_LIMIT,
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
    handleBulkApplyComplete,
    openBulkRosterDialog,
  }
}
