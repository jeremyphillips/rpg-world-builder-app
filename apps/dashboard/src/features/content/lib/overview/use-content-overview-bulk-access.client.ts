'use client'

import { useCallback, useId, useState } from 'react'

import type { BulkCampaignAccessApplyResult } from '../campaign-access/bulk/bulk-apply-campaign-access.lib'
import { CONTENT_OVERVIEW_BULK_SELECTION_LIMIT } from './content-overview-selection.constants'
import { useContentOverviewSelection } from './use-content-overview-selection'

export function useContentOverviewBulkAccess<T extends { id: string }>(
  visibleRowIds: ReadonlySet<string>,
) {
  const selectionLiveRegionId = useId()
  const [bulkAccessOpen, setBulkAccessOpen] = useState(false)
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

  const handleBulkApplyComplete = useCallback(
    (result: Pick<BulkCampaignAccessApplyResult, 'updatedIds' | 'fullSuccess'>) => {
      removeFromSelection(result.updatedIds)

      if (result.fullSuccess) {
        setBulkAccessOpen(false)
        exitSelectionMode()
      }
    },
    [exitSelectionMode, removeFromSelection],
  )

  const handleExitSelectionMode = useCallback(() => {
    setBulkAccessOpen(false)
    exitSelectionMode()
  }, [exitSelectionMode])

  const openBulkAccessDialog = useCallback(() => {
    setBulkAccessOpen(true)
  }, [])

  return {
    bulkAccessOpen,
    setBulkAccessOpen,
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
    handleBulkApplyComplete,
    openBulkAccessDialog,
  }
}
