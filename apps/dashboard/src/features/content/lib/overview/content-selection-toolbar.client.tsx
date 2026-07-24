'use client'

import { Button } from '@rpg/ui'

import { formatBulkCampaignAccessApplyDisclosure } from '../campaign-access/campaign-access-labels'
import { ContentBulkActionsMenu } from './content-bulk-actions-menu.client'

export type ContentSelectionToolbarProps = {
  selectedRowCount: number
  selectionLimit: number
  liveRegionId: string
  liveRegionMessage: string
  onSelectAllPage: () => void
  onClearSelection: () => void
  onDone: () => void
  onEditCampaignAccess?: () => void
}

/** Selection-mode utility strip — count, page select-all, bulk actions, clear, done. */
export function ContentSelectionToolbar({
  selectedRowCount,
  selectionLimit,
  liveRegionId,
  liveRegionMessage,
  onSelectAllPage,
  onClearSelection,
  onDone,
  onEditCampaignAccess,
}: ContentSelectionToolbarProps) {
  const hasSelection = selectedRowCount > 0

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-sm text-muted-foreground">{selectedRowCount} selected</span>
        <span id={liveRegionId} className="sr-only" aria-live="polite">
          {liveRegionMessage}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1">
        {hasSelection ? (
          <>
            {onEditCampaignAccess ? (
              <ContentBulkActionsMenu onEditCampaignAccess={onEditCampaignAccess} />
            ) : null}
            <Button type="button" variant="ghost" size="sm" onClick={onClearSelection}>
              Clear selection
            </Button>
          </>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={onSelectAllPage}>
            Select all page
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDone}
          aria-label="Exit selection mode"
        >
          Done
        </Button>
      </div>

      {hasSelection ? (
        <span className="sr-only">{formatBulkCampaignAccessApplyDisclosure(selectionLimit)}</span>
      ) : null}
    </div>
  )
}
