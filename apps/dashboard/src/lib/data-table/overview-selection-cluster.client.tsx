'use client'

import { ListChecks } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { Button } from '@rpg/ui'

import {
  resolvePageSelectionActionLabel,
  shouldShowPageSelectionAction,
} from './overview-selection-cluster.lib'

export const OVERVIEW_SELECTION_COLUMN_INSET = '2.5rem'

export type OverviewSelectionClusterProps = {
  mode: 'browse' | 'selection'
  selectedCount: number
  selectionLiveRegionId: string
  selectionLiveRegionMessage?: string
  selectionCapDescriptionId?: string
  selectionLimit?: number
  pageSelectableCount: number
  isAllPageRowsSelected: boolean
  onToggleAllPageRowsSelected: (value?: boolean) => void
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  onBulkActions?: () => void
  bulkActionsMenu?: ReactNode
  selectTriggerRef?: React.RefObject<HTMLButtonElement | null>
}

/** Dashboard selection cluster — browse Select trigger or selection-mode actions. */
export function OverviewSelectionCluster({
  mode,
  selectedCount,
  selectionLiveRegionId,
  selectionLiveRegionMessage,
  selectionCapDescriptionId,
  selectionLimit,
  pageSelectableCount,
  isAllPageRowsSelected,
  onToggleAllPageRowsSelected,
  onEnterSelectionMode,
  onExitSelectionMode,
  onBulkActions,
  bulkActionsMenu,
  selectTriggerRef: selectTriggerRefProp,
}: OverviewSelectionClusterProps) {
  const internalSelectRef = useRef<HTMLButtonElement>(null)
  const selectTriggerRef = selectTriggerRefProp ?? internalSelectRef

  if (mode === 'browse') {
    return (
      <Button
        ref={selectTriggerRef}
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={false}
        onClick={onEnterSelectionMode}
      >
        <ListChecks className="size-3.5" aria-hidden />
        Select
      </Button>
    )
  }

  const remainingSelectionCapacity = Math.max(0, (selectionLimit ?? Infinity) - selectedCount)
  const pageActionLabel = resolvePageSelectionActionLabel({
    isAllPageRowsSelected,
    pageSelectableCount,
    remainingSelectionCapacity,
  })
  const showPageAction = shouldShowPageSelectionAction(pageSelectableCount, isAllPageRowsSelected)

  const handlePageAction = () => {
    if (isAllPageRowsSelected) {
      onToggleAllPageRowsSelected(false)
      return
    }

    if (remainingSelectionCapacity < pageSelectableCount) {
      onToggleAllPageRowsSelected(true)
      return
    }

    onToggleAllPageRowsSelected(true)
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-sm tabular-nums text-muted-foreground"
      >
        {selectedCount} selected
      </span>
      <span id={selectionLiveRegionId} className="sr-only" aria-live="polite">
        {selectionLiveRegionMessage}
      </span>
      {selectionCapDescriptionId ? (
        <span id={selectionCapDescriptionId} className="sr-only">
          {selectionLimit
            ? `Selection is limited to ${selectionLimit} items.`
            : 'Selection limit applies.'}
        </span>
      ) : null}

      {showPageAction ? (
        <Button type="button" variant="ghost" size="sm" onClick={handlePageAction}>
          {pageActionLabel}
        </Button>
      ) : null}

      {selectedCount > 0
        ? (bulkActionsMenu ??
          (onBulkActions ? (
            <Button type="button" variant="ghost" size="sm" onClick={onBulkActions}>
              Bulk actions
            </Button>
          ) : null))
        : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          onExitSelectionMode()
          selectTriggerRef.current?.focus()
        }}
      >
        Done
      </Button>
    </div>
  )
}
