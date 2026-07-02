'use client'

import * as React from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import { cn } from '../../lib/utils'
import type { ArrayItemHeaderConfig } from '../field-config'
import {
  resolveArrayItemHeaderLabels,
  ARRAY_ITEM_HEADER_DIVIDER,
  type ResolvedArrayItemHeader,
} from '../config/array-item-config.lib'
import {
  arrayItemChromeColumnClasses,
  arrayItemCollapseButtonClasses,
  arrayItemDragHandleClasses,
  arrayItemHeaderContentClasses,
  arrayItemHeaderDividerClasses,
  arrayItemHeaderFallbackClasses,
  arrayItemHeaderShellClasses,
  arrayItemHeaderSummaryClasses,
  arrayItemHeaderSummaryIndentClasses,
  arrayItemHeaderTitleClasses,
  arrayItemToolbarContentClasses,
  arrayItemToolbarRowClasses,
  type ArrayItemLeadingChromeOptions,
} from './array-item-toolbar.variants'

export interface ArrayItemDragHandleProps {
  ariaLabel: string
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  compact?: boolean
}

export function ArrayItemDragHandle({
  ariaLabel,
  attributes,
  listeners,
  compact = false,
}: ArrayItemDragHandleProps) {
  return (
    <button
      type="button"
      className={arrayItemDragHandleClasses({ compact })}
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
        {header.showFallbackInTitle ? (
          <>
            {header.showDivider ? (
              <span className={arrayItemHeaderDividerClasses} aria-hidden>
                {ARRAY_ITEM_HEADER_DIVIDER}
              </span>
            ) : null}
            <span className={arrayItemHeaderFallbackClasses}>{header.fallback}</span>
          </>
        ) : null}
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
  bodyId: string
  titleId: string
  /** When true, only drag + title/fields render (compact inline row). */
  compact?: boolean
  children?: React.ReactNode
}

/** Leading chrome and title/compact fields — trailing actions live in `ArrayItemActionsRail`. */
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

  const gripVisible = showDragHandle && Boolean(dragHandleProps)
  const leadingChrome: ArrayItemLeadingChromeOptions = { showDragHandle: gripVisible, collapsible }

  const headerContentClasses = cn(
    arrayItemHeaderContentClasses,
    'min-w-0 flex-1',
    arrayItemToolbarContentClasses(leadingChrome),
  )

  const titleRow = (
    <div className={arrayItemToolbarRowClasses({ ...leadingChrome, compact })}>
      {gripVisible && dragHandleProps ? (
        <div className={arrayItemChromeColumnClasses}>
          <ArrayItemDragHandle
            {...dragHandleProps}
            compact={compact}
            ariaLabel={`Drag to reorder ${header.ariaLabel}`}
          />
        </div>
      ) : null}
      {collapsible ? (
        <div className={arrayItemChromeColumnClasses}>
          <button
            type="button"
            className={arrayItemCollapseButtonClasses}
            aria-expanded={!collapsed}
            aria-controls={bodyId}
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${header.ariaLabel}`}
            onClick={onToggleCollapse}
          >
            <ChevronDown
              className={cn('size-4 transition-transform', collapsed && '-rotate-90')}
              aria-hidden
            />
          </button>
        </div>
      ) : null}
      <div id={titleId} className={headerContentClasses}>
        {compact ? (
          <>
            {!gripVisible && !collapsible ? (
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
    </div>
  )

  if (!summary) return titleRow

  return (
    <div className={arrayItemHeaderShellClasses}>
      {titleRow}
      <p
        className={cn(
          arrayItemHeaderSummaryClasses,
          arrayItemHeaderSummaryIndentClasses(leadingChrome),
        )}
      >
        {summary}
      </p>
    </div>
  )
}
