'use client'

import { useCallback, useState } from 'react'

import type { BulkCampaignAccessApplyResult } from '../campaign-access/bulk/bulk-apply-campaign-access.lib'
import { useContentOverviewBulkSelection } from './use-content-overview-bulk-selection'

export function useContentOverviewBulkAccess<T extends { id: string }>(
  visibleRowIds: ReadonlySet<string>,
) {
  const [bulkAccessOpen, setBulkAccessOpen] = useState(false)
  const selection = useContentOverviewBulkSelection<T>(visibleRowIds)

  const handleBulkApplyComplete = useCallback(
    (result: Pick<BulkCampaignAccessApplyResult, 'updatedIds' | 'fullSuccess'>) => {
      selection.removeFromSelection(result.updatedIds)

      if (result.fullSuccess) {
        setBulkAccessOpen(false)
        selection.handleExitSelectionMode()
      }
    },
    [selection],
  )

  const handleExitSelectionMode = useCallback(() => {
    setBulkAccessOpen(false)
    selection.handleExitSelectionMode()
  }, [selection])

  const openBulkAccessDialog = useCallback(() => {
    setBulkAccessOpen(true)
  }, [])

  return {
    ...selection,
    bulkAccessOpen,
    setBulkAccessOpen,
    handleBulkApplyComplete,
    openBulkAccessDialog,
    handleExitSelectionMode,
  }
}
