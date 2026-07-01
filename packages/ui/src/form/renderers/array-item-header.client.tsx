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
  type ResolvedArrayItemHeader,
} from '../config/array-item-config.lib'
import {
  arrayItemCollapseButtonClasses,
  arrayItemDragHandleClasses,
  arrayItemDragHandleVisibleClasses,
  arrayItemHeaderSummaryClasses,
  arrayItemHeaderTitleClasses,
  arrayItemRemoveButtonClasses,
  arrayItemToolbarRowClasses,
} from './array-item-toolbar.variants'

export interface ArrayItemDragHandleProps {
  ariaLabel: string
  isDragging?: boolean
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
}

export function ArrayItemDragHandle({
  ariaLabel,
  isDragging = false,
  attributes,
  listeners,
}: ArrayItemDragHandleProps) {
  return (
    <button
      type="button"
      className={cn(arrayItemDragHandleClasses, isDragging && arrayItemDragHandleVisibleClasses)}
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-3.5" aria-hidden />
    </button>
  )
}

interface ArrayItemHeaderTitleProps {
  header: ResolvedArrayItemHeader
  summary?: string
  collapsed: boolean
  titleId: string
}

function ArrayItemHeaderTitle({ header, summary, collapsed, titleId }: ArrayItemHeaderTitleProps) {
  if (header.srOnly) {
    return (
      <span id={titleId} className="sr-only">
        {header.ariaLabel}
      </span>
    )
  }

  if (collapsed && summary) {
    return (
      <div id={titleId} className="min-w-0 flex-1">
        <div className={arrayItemHeaderTitleClasses}>
          {header.primary ? (
            <>
              <span>{header.primary}</span>
              {header.showDivider ? (
                <span className="mx-1.5 text-muted-foreground" aria-hidden>
                  |
                </span>
              ) : null}
              <span className="text-muted-foreground">{header.fallback}</span>
            </>
          ) : (
            header.fallback
          )}
        </div>
        <p className={cn(arrayItemHeaderSummaryClasses, 'mt-1')}>{summary}</p>
      </div>
    )
  }

  return (
    <div id={titleId} className={arrayItemHeaderTitleClasses}>
      {header.primary ? (
        <>
          <span>{header.primary}</span>
          {header.showDivider ? (
            <span className="mx-1.5 text-muted-foreground" aria-hidden>
              |
            </span>
          ) : null}
          <span className="text-muted-foreground">{header.fallback}</span>
        </>
      ) : (
        header.fallback
      )}
    </div>
  )
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
    collapsed && headerConfig.summary ? headerConfig.summary(itemValues, index) : undefined

  return (
    <div className={arrayItemToolbarRowClasses}>
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
      {compact ? (
        <>
          {!showDragHandle && !collapsible ? (
            <span className="sr-only" id={titleId}>
              {header.ariaLabel}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">{children}</div>
        </>
      ) : (
        <ArrayItemHeaderTitle
          header={header}
          summary={summary}
          collapsed={collapsed}
          titleId={titleId}
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={arrayItemRemoveButtonClasses}
        disabled={!canRemove}
        aria-label={`Remove ${header.ariaLabel}`}
        onClick={onRemove}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </div>
  )
}
