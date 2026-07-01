'use client'

import * as React from 'react'
import { ChevronDown, GripVertical, Trash2 } from 'lucide-react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import { Button } from '../../components/ui/button.client'
import { cn } from '../../lib/utils'
import type { ArrayItemHeaderConfig } from '../field-config'
import {
  resolveArrayItemHeaderLabels,
  ARRAY_ITEM_HEADER_DIVIDER,
  type ResolvedArrayItemHeader,
} from '../config/array-item-config.lib'
import {
  arrayItemCollapseButtonClasses,
  arrayItemDragHandleClasses,
  arrayItemHeaderContentClasses,
  arrayItemHeaderDividerClasses,
  arrayItemHeaderFallbackClasses,
  arrayItemHeaderShellClasses,
  arrayItemHeaderSummaryClasses,
  arrayItemHeaderSummaryIndentClasses,
  arrayItemHeaderTitleClasses,
  arrayItemRemoveButtonClasses,
  arrayItemToolbarContentClasses,
  arrayItemToolbarRowClasses,
} from './array-item-toolbar.variants'

export interface ArrayItemDragHandleProps {
  ariaLabel: string
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
}

export function ArrayItemDragHandle({
  ariaLabel,
  attributes,
  listeners,
}: ArrayItemDragHandleProps) {
  return (
    <button
      type="button"
      className={arrayItemDragHandleClasses}
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-3.5" aria-hidden />
    </button>
  )
}

function renderArrayItemTitleLine(header: ResolvedArrayItemHeader): React.ReactNode {
  if (header.primary) {
    return (
      <>
        <span>{header.primary}</span>
        {header.showDivider ? (
          <span className={arrayItemHeaderDividerClasses} aria-hidden>
            {ARRAY_ITEM_HEADER_DIVIDER}
          </span>
        ) : null}
        <span className={arrayItemHeaderFallbackClasses}>{header.fallback}</span>
      </>
    )
  }

  return header.fallback
}

export interface ArrayItemToolbarProps {
  legend: string
  index: number
  headerConfig: ArrayItemHeaderConfig
  itemValues: Record<string, unknown>
  watchedPrimary: unknown
  showDragHandle: boolean
  dragHandleProps?: ArrayItemDragHandleProps
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  canRemove: boolean
  onRemove: () => void
  bodyId: string
  titleId: string
  /** When true, only drag + remove render (compact inline row). */
  compact?: boolean
  children?: React.ReactNode
}

export function ArrayItemToolbar({
  legend,
  index,
  headerConfig,
  itemValues,
  watchedPrimary,
  showDragHandle,
  dragHandleProps,
  collapsible,
  collapsed,
  onToggleCollapse,
  canRemove,
  onRemove,
  bodyId,
  titleId,
  compact = false,
  children,
}: ArrayItemToolbarProps) {
  const header = resolveArrayItemHeaderLabels(
    headerConfig,
    itemValues,
    index,
    watchedPrimary,
    legend,
  )
  const summary =
    !compact && headerConfig.summary ? headerConfig.summary(itemValues, index) : undefined

  const headerContentClasses = cn(
    arrayItemHeaderContentClasses,
    collapsible && arrayItemToolbarContentClasses,
  )

  const titleRow = (
    <div className={cn(arrayItemToolbarRowClasses, 'items-center')}>
      {showDragHandle && dragHandleProps ? (
        <ArrayItemDragHandle
          {...dragHandleProps}
          ariaLabel={`Drag to reorder ${header.ariaLabel}`}
        />
      ) : null}
      {collapsible ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(arrayItemCollapseButtonClasses, 'shrink-0')}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${header.ariaLabel}`}
          onClick={onToggleCollapse}
        >
          <ChevronDown
            className={cn('size-4 transition-transform', collapsed && '-rotate-90')}
            aria-hidden
          />
        </Button>
      ) : null}
      <div id={titleId} className={headerContentClasses}>
        {compact ? (
          <>
            {!showDragHandle && !collapsible ? (
              <span className="sr-only">{header.ariaLabel}</span>
            ) : null}
            {children}
          </>
        ) : header.srOnly ? (
          <span className="sr-only">{header.ariaLabel}</span>
        ) : (
          <div className={arrayItemHeaderTitleClasses}>{renderArrayItemTitleLine(header)}</div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={arrayItemRemoveButtonClasses}
        disabled={!canRemove}
        aria-label={`Remove ${header.ariaLabel}`}
        onClick={onRemove}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  )

  if (!summary) return titleRow

  return (
    <div className={arrayItemHeaderShellClasses}>
      {titleRow}
      <p
        className={cn(
          arrayItemHeaderSummaryClasses,
          arrayItemHeaderSummaryIndentClasses({ showDragHandle, collapsible }),
        )}
      >
        {summary}
      </p>
    </div>
  )
}
