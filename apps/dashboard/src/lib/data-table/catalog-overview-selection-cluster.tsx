import type { ReactNode, RefObject } from 'react'
import type { DataTableUtilityControls } from '@rpg/ui'

import { OverviewSelectionCluster } from './overview-selection-cluster'

type CatalogOverviewSelectionClusterProps<T extends { id: string }> = {
  controls: DataTableUtilityControls<T>
  selectionMode: boolean
  selectionLiveRegionId: string
  selectionLiveRegionMessage?: string
  selectionCapDescriptionId: string
  selectionLimit: number
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  bulkActionsMenu?: ReactNode
  selectTriggerRef?: RefObject<HTMLButtonElement | null>
}

export function CatalogOverviewSelectionCluster<T extends { id: string }>({
  controls,
  selectionMode,
  selectionLiveRegionId,
  selectionLiveRegionMessage,
  selectionCapDescriptionId,
  selectionLimit,
  onEnterSelectionMode,
  onExitSelectionMode,
  bulkActionsMenu,
  selectTriggerRef,
}: CatalogOverviewSelectionClusterProps<T>) {
  return (
    <OverviewSelectionCluster
      mode={selectionMode ? 'selection' : 'browse'}
      selectedCount={controls.selectedRowCount}
      selectionLiveRegionId={selectionLiveRegionId}
      selectionLiveRegionMessage={selectionLiveRegionMessage}
      selectionCapDescriptionId={selectionCapDescriptionId}
      selectionLimit={selectionLimit}
      pageSelectableCount={controls.pageSelectableRowCount}
      isAllPageRowsSelected={controls.isAllPageRowsSelected}
      onToggleAllPageRowsSelected={controls.toggleAllPageRowsSelected}
      onEnterSelectionMode={onEnterSelectionMode}
      onExitSelectionMode={onExitSelectionMode}
      bulkActionsMenu={controls.selectedRowCount > 0 ? bulkActionsMenu : undefined}
      selectTriggerRef={selectTriggerRef}
    />
  )
}
