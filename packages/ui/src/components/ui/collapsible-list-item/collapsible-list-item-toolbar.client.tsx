'use client'

import * as React from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import { cn } from '../../../lib/utils'
import {
  collapsibleListItemChromeColumnClasses,
  collapsibleListItemCollapseButtonClasses,
  collapsibleListItemDragHandleClasses,
  collapsibleListItemToolbarContentClasses,
  collapsibleListItemToolbarRowClasses,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item.variants'

export interface CollapsibleListItemDragHandleProps {
  ariaLabel: string
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  compact?: boolean
}

export function CollapsibleListItemDragHandle({
  ariaLabel,
  attributes,
  listeners,
  compact = false,
}: CollapsibleListItemDragHandleProps) {
  return (
    <button
      type="button"
      className={collapsibleListItemDragHandleClasses({ compact })}
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-3.5" aria-hidden />
    </button>
  )
}

export interface CollapsibleListItemCollapseButtonProps {
  collapsed: boolean
  bodyId: string
  ariaLabel: string
  onToggleCollapse: () => void
}

export function CollapsibleListItemCollapseButton({
  collapsed,
  bodyId,
  ariaLabel,
  onToggleCollapse,
}: CollapsibleListItemCollapseButtonProps) {
  return (
    <button
      type="button"
      className={collapsibleListItemCollapseButtonClasses}
      aria-expanded={!collapsed}
      aria-controls={bodyId}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${ariaLabel}`}
      onClick={onToggleCollapse}
    >
      <ChevronDown
        className={cn('size-4 transition-transform', collapsed && '-rotate-90')}
        aria-hidden
      />
    </button>
  )
}

export interface CollapsibleListItemToolbarProps {
  titleId: string
  toolbarAriaLabel: string
  leadingChrome: CollapsibleListItemLeadingChromeOptions
  gripVisible: boolean
  dragHandleProps?: CollapsibleListItemDragHandleProps
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  compact?: boolean
  header: React.ReactNode
  summary?: React.ReactNode
}

/** Leading chrome row — optional grip, optional collapse caret, header content, optional summary. */
export function CollapsibleListItemToolbar({
  titleId,
  toolbarAriaLabel,
  leadingChrome,
  gripVisible,
  dragHandleProps,
  collapsible,
  collapsed,
  onToggleCollapse,
  bodyId,
  compact = false,
  header,
  summary,
}: CollapsibleListItemToolbarProps) {
  const headerContentClasses = cn(
    'flex min-w-0 min-h-0 flex-1 items-center',
    collapsibleListItemToolbarContentClasses(leadingChrome),
  )

  const titleRow = (
    <div className={collapsibleListItemToolbarRowClasses({ ...leadingChrome, compact })}>
      {gripVisible && dragHandleProps ? (
        <div className={collapsibleListItemChromeColumnClasses}>
          <CollapsibleListItemDragHandle
            {...dragHandleProps}
            compact={compact}
            ariaLabel={`Drag to reorder ${toolbarAriaLabel}`}
          />
        </div>
      ) : null}
      {collapsible ? (
        <div className={collapsibleListItemChromeColumnClasses}>
          <CollapsibleListItemCollapseButton
            collapsed={collapsed}
            bodyId={bodyId}
            ariaLabel={toolbarAriaLabel}
            onToggleCollapse={onToggleCollapse}
          />
        </div>
      ) : null}
      <div id={titleId} className={headerContentClasses}>
        {header}
      </div>
    </div>
  )

  if (!summary) return titleRow

  return (
    <div className="flex min-w-0 flex-col gap-0">
      {titleRow}
      {summary}
    </div>
  )
}
