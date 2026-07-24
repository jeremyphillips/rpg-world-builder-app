'use client'

import {
  Button,
  type DataTableColumnVisibilityTriggerProps,
  type DataTableUtilityControls,
} from '@rpg/ui'

import { ContentSelectionToolbar } from './content-selection-toolbar.client'

export type ContentTableUtilityStripProps<T extends { name: string }> = {
  resultCountLabel: string
  canManage: boolean
  selectionMode: boolean
  selectedRowCount: number
  selectionLimit: number
  selectionLiveRegionId: string
  selectionLiveRegionMessage: string
  selectionCapDescriptionId: string
  ColumnVisibilityTrigger: React.ComponentType<DataTableColumnVisibilityTriggerProps>
  controls: DataTableUtilityControls<T>
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  onEditCampaignAccess?: () => void
}

const COLUMNS_ARIA_LABEL = 'Choose visible columns'

/** Tinted overview strip — browsing or selection layouts. */
export function ContentTableUtilityStrip<T extends { name: string }>({
  resultCountLabel,
  canManage,
  selectionMode,
  selectedRowCount,
  selectionLimit,
  selectionLiveRegionId,
  selectionLiveRegionMessage,
  selectionCapDescriptionId,
  ColumnVisibilityTrigger,
  controls,
  onEnterSelectionMode,
  onExitSelectionMode,
  onEditCampaignAccess,
}: ContentTableUtilityStripProps<T>) {
  if (selectionMode) {
    return (
      <>
        <span id={selectionCapDescriptionId} className="sr-only">
          Selection is limited to {selectionLimit} items.
        </span>
        <ContentSelectionToolbar
          selectedRowCount={selectedRowCount}
          selectionLimit={selectionLimit}
          liveRegionId={selectionLiveRegionId}
          liveRegionMessage={selectionLiveRegionMessage}
          onSelectAllPage={() => controls.toggleAllPageRowsSelected(true)}
          onClearSelection={controls.clearRowSelection}
          onDone={onExitSelectionMode}
          onEditCampaignAccess={onEditCampaignAccess}
        />
      </>
    )
  }

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{resultCountLabel}</span>
      <div className="flex items-center gap-1">
        {canManage ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={false}
            onClick={onEnterSelectionMode}
          >
            Select
          </Button>
        ) : null}
        <ColumnVisibilityTrigger aria-label={COLUMNS_ARIA_LABEL} showLabel={false} />
      </div>
    </div>
  )
}
