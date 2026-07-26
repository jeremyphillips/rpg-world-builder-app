'use client'

import type { ReactNode } from 'react'
import type { DataTableUtilityControls } from '@rpg/ui'

import { CatalogOverviewSelectionCluster } from './catalog-overview-selection-cluster.client'
import type { OverviewRowSelectionState } from './use-overview-selection'

export type CatalogOverviewSelectionConfig<T extends { id: string }> = {
  enabled: boolean
  selectionMode: boolean
  rowSelection: OverviewRowSelectionState
  selectionLimit: number
  selectionLiveRegionId: string
  selectionLiveRegionMessage?: string
  selectionCapDescriptionId: string
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  onRowSelectionChange: (rows: T[]) => void
  onRowSelectionStateChange: (state: OverviewRowSelectionState) => void
  getRowCanSelect: (row: T) => boolean
  bulkActionsMenu?: ReactNode
  selectTriggerRef?: React.RefObject<HTMLButtonElement | null>
  getSelectRowLabel?: (row: T) => string
}

export function renderCatalogOverviewSelectionCluster<T extends { id: string }>(
  selection: CatalogOverviewSelectionConfig<T>,
  controls: DataTableUtilityControls<T>,
) {
  return (
    <CatalogOverviewSelectionCluster
      controls={controls}
      selectionMode={selection.selectionMode}
      selectionLiveRegionId={selection.selectionLiveRegionId}
      selectionLiveRegionMessage={selection.selectionLiveRegionMessage}
      selectionCapDescriptionId={selection.selectionCapDescriptionId}
      selectionLimit={selection.selectionLimit}
      onEnterSelectionMode={selection.onEnterSelectionMode}
      onExitSelectionMode={selection.onExitSelectionMode}
      bulkActionsMenu={selection.bulkActionsMenu}
      selectTriggerRef={selection.selectTriggerRef}
    />
  )
}

export function buildCatalogOverviewSelectionLabels<T extends { id: string }>(
  selection: CatalogOverviewSelectionConfig<T>,
) {
  if (!selection.selectionMode) return undefined

  return {
    selectAll: (pageRowCount: number) => `Select all ${pageRowCount} rows on this page`,
    selectRow: (row: T) =>
      selection.getSelectRowLabel ? `Select ${selection.getSelectRowLabel(row)}` : `Select row`,
  }
}

export function buildCatalogOverviewSelectionFrameProps<T extends { id: string }>(
  selection: CatalogOverviewSelectionConfig<T> | undefined,
) {
  if (!selection?.enabled) {
    return {
      renderLeadingActions: undefined,
      selectionLabels: undefined,
      selectionModeActive: false,
      enableRowSelection: false,
      rowSelection: undefined,
      onRowSelectionChange: undefined,
      onRowSelectionStateChange: undefined,
      getRowCanSelect: undefined,
      rowSelectionDescribedBy: undefined,
    }
  }

  return {
    renderLeadingActions: (controls: DataTableUtilityControls<T>) =>
      renderCatalogOverviewSelectionCluster(selection, controls),
    selectionLabels: buildCatalogOverviewSelectionLabels(selection),
    selectionModeActive: selection.selectionMode,
    enableRowSelection: selection.selectionMode,
    rowSelection: selection.rowSelection,
    onRowSelectionChange: selection.onRowSelectionChange,
    onRowSelectionStateChange: selection.onRowSelectionStateChange,
    getRowCanSelect: selection.getRowCanSelect,
    rowSelectionDescribedBy: selection.selectionCapDescriptionId,
  }
}
