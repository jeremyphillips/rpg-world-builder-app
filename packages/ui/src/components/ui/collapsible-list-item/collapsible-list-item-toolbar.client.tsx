'use client'
import { Icon } from '../icon/icon'

import * as React from 'react'
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
import {
  resolveCollapsibleListItemReserveCaretSlot,
  resolveCollapsibleListItemReserveDragHandleSlot,
} from './collapsible-list-item-leading-chrome.lib'

export interface CollapsibleListItemDragHandleProps {
  ariaLabel: string
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  compact?: boolean
  className?: string
}

export function CollapsibleListItemDragHandle({
  ariaLabel,
  attributes,
  listeners,
  compact = false,
  className,
}: CollapsibleListItemDragHandleProps) {
  return (
    <button
      type="button"
      className={cn(collapsibleListItemDragHandleClasses({ compact }), className)}
      aria-label={ariaLabel}
      onClick={(event) => event.stopPropagation()}
      {...attributes}
      {...listeners}
    >
      <Icon name="grip-vertical" size="md" />
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
      <Icon
        name="chevron-down"
        size="lg"
        className={cn('transition-transform', collapsed && '-rotate-90')}
      />
    </button>
  )
}

export type CollapsibleListItemToolbarLeadingChromePlacement = 'toolbar' | 'none'

function CollapsibleListItemGripColumn({
  reserveDragHandleSlot,
  gripVisible,
  dragHandleProps,
  toolbarAriaLabel,
  compact,
}: {
  reserveDragHandleSlot: boolean
  gripVisible: boolean
  dragHandleProps?: CollapsibleListItemDragHandleProps
  toolbarAriaLabel: string
  compact: boolean
}) {
  if (!reserveDragHandleSlot) return null
  if (gripVisible && dragHandleProps) {
    return (
      <div className={collapsibleListItemChromeColumnClasses}>
        <CollapsibleListItemDragHandle
          {...dragHandleProps}
          compact={compact}
          ariaLabel={`Drag to reorder ${toolbarAriaLabel}`}
        />
      </div>
    )
  }
  return <CollapsibleListItemDragHandlePlaceholder compact={compact} />
}

function CollapsibleListItemCaretColumn({
  reserveCaretSlot,
  collapsible,
  collapsed,
  bodyId,
  toolbarAriaLabel,
  onToggleCollapse,
}: {
  reserveCaretSlot: boolean
  collapsible: boolean
  collapsed: boolean
  bodyId: string
  toolbarAriaLabel: string
  onToggleCollapse: () => void
}) {
  if (!reserveCaretSlot) return null
  return (
    <div
      className={collapsibleListItemChromeColumnClasses}
      aria-hidden={collapsible ? undefined : true}
    >
      {collapsible ? (
        <CollapsibleListItemCollapseButton
          collapsed={collapsed}
          bodyId={bodyId}
          ariaLabel={toolbarAriaLabel}
          onToggleCollapse={onToggleCollapse}
        />
      ) : null}
    </div>
  )
}

function CollapsibleListItemDragHandlePlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className={collapsibleListItemChromeColumnClasses} aria-hidden>
      <span
        className={cn(
          collapsibleListItemDragHandleClasses({ compact }),
          'pointer-events-none opacity-0',
        )}
      >
        <Icon name="grip-vertical" size="2xl" />
      </span>
    </div>
  )
}

export interface CollapsibleListItemToolbarProps {
  titleId: string
  toolbarAriaLabel: string
  leadingChrome: CollapsibleListItemLeadingChromeOptions
  /** When true, an interactive drag handle is available. */
  gripVisible: boolean
  dragHandleProps?: CollapsibleListItemDragHandleProps
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  compact?: boolean
  /** When `none`, grip/caret render outside the toolbar (e.g. EntityLeadingRail). */
  leadingChromePlacement?: CollapsibleListItemToolbarLeadingChromePlacement
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
  leadingChromePlacement = 'toolbar',
  header,
  summary,
}: CollapsibleListItemToolbarProps) {
  const reserveDragHandleSlot = resolveCollapsibleListItemReserveDragHandleSlot(leadingChrome)
  const reserveCaretSlot = resolveCollapsibleListItemReserveCaretSlot(leadingChrome)
  const renderLeadingChromeInToolbar = leadingChromePlacement === 'toolbar'
  const headerContentClasses = cn(
    'flex min-w-0 flex-1',
    compact ? 'items-start' : 'items-center',
    renderLeadingChromeInToolbar
      ? collapsibleListItemToolbarContentClasses(leadingChrome)
      : 'min-w-0',
  )

  const titleRow = (
    <div className={collapsibleListItemToolbarRowClasses({ ...leadingChrome, compact })}>
      {renderLeadingChromeInToolbar ? (
        <CollapsibleListItemGripColumn
          reserveDragHandleSlot={reserveDragHandleSlot}
          gripVisible={gripVisible}
          dragHandleProps={dragHandleProps}
          toolbarAriaLabel={toolbarAriaLabel}
          compact={compact}
        />
      ) : null}
      {renderLeadingChromeInToolbar ? (
        <CollapsibleListItemCaretColumn
          reserveCaretSlot={reserveCaretSlot}
          collapsible={collapsible}
          collapsed={collapsed}
          bodyId={bodyId}
          toolbarAriaLabel={toolbarAriaLabel}
          onToggleCollapse={onToggleCollapse}
        />
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
