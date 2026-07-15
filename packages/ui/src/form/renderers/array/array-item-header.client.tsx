'use client'

import * as React from 'react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import { cn } from '../../../lib/utils'
import {
  CollapsibleListItemCollapseButton,
  CollapsibleListItemDragHandle,
} from '../../../components/ui/collapsible-list-item/collapsible-list-item-toolbar.client'
import type { ArrayItemHeaderConfig } from '../../field-config'
import {
  resolveArrayItemHeaderLabels,
  ARRAY_ITEM_HEADER_DIVIDER,
  type ResolvedArrayItemHeader,
} from '../../config/array/array-item-config.lib'
import {
  arrayItemChromeColumnClasses,
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
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'

export interface ArrayItemDragHandleProps {
  ariaLabel: string
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  compact?: boolean
}

export function ArrayItemDragHandle(props: ArrayItemDragHandleProps) {
  return <CollapsibleListItemDragHandle {...props} />
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

interface ArrayItemCollapseButtonProps {
  collapsed: boolean
  bodyId: string
  ariaLabel: string
  onToggleCollapse: () => void
}

function ArrayItemCollapseButton({
  collapsed,
  bodyId,
  ariaLabel,
  onToggleCollapse,
}: ArrayItemCollapseButtonProps) {
  return (
    <CollapsibleListItemCollapseButton
      collapsed={collapsed}
      bodyId={bodyId}
      ariaLabel={ariaLabel}
      onToggleCollapse={onToggleCollapse}
    />
  )
}

interface ArrayItemTitleContentProps {
  header: ResolvedArrayItemHeader
  compact: boolean
  gripVisible: boolean
  collapsible: boolean
  children?: React.ReactNode
}

function ArrayItemTitleContent({
  header,
  compact,
  gripVisible,
  collapsible,
  children,
}: ArrayItemTitleContentProps) {
  if (compact) {
    return (
      <>
        {!gripVisible && !collapsible ? <span className="sr-only">{header.ariaLabel}</span> : null}
        {children}
      </>
    )
  }

  if (header.srOnly) return <span className="sr-only">{header.ariaLabel}</span>

  return <div className={arrayItemHeaderTitleClasses}>{renderArrayItemTitleLine(header)}</div>
}

interface ArrayItemTitleRowProps {
  header: ResolvedArrayItemHeader
  headerContentClasses: string
  leadingChrome: ArrayItemLeadingChromeOptions
  compact: boolean
  gripVisible: boolean
  dragHandleProps?: ArrayItemDragHandleProps
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  titleId: string
  children?: React.ReactNode
}

function ArrayItemTitleRow({
  header,
  headerContentClasses,
  leadingChrome,
  compact,
  gripVisible,
  dragHandleProps,
  collapsible,
  collapsed,
  onToggleCollapse,
  bodyId,
  titleId,
  children,
}: ArrayItemTitleRowProps) {
  return (
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
          <ArrayItemCollapseButton
            collapsed={collapsed}
            bodyId={bodyId}
            ariaLabel={header.ariaLabel}
            onToggleCollapse={onToggleCollapse}
          />
        </div>
      ) : null}
      <div id={titleId} className={headerContentClasses}>
        <ArrayItemTitleContent
          header={header}
          compact={compact}
          gripVisible={gripVisible}
          collapsible={collapsible}
        >
          {children}
        </ArrayItemTitleContent>
      </div>
    </div>
  )
}

interface ArrayItemHeaderExtrasProps {
  summary?: string
  issueSummary?: ArrayItemIssueSummaryProps
  collapsed: boolean
  leadingChrome: ArrayItemLeadingChromeOptions
}

function ArrayItemHeaderExtras({
  summary,
  issueSummary,
  collapsed,
  leadingChrome,
}: ArrayItemHeaderExtrasProps) {
  return (
    <>
      {issueSummary ? (
        <ArrayItemIssueSummary
          {...issueSummary}
          placement={issueSummary.placement ?? (collapsed ? 'collapsed' : 'expanded')}
          className={cn(issueSummary.className, arrayItemHeaderSummaryIndentClasses(leadingChrome))}
        />
      ) : null}
      {summary ? (
        <p
          className={cn(
            arrayItemHeaderSummaryClasses,
            arrayItemHeaderSummaryIndentClasses(leadingChrome),
          )}
        >
          {summary}
        </p>
      ) : null}
    </>
  )
}

export interface ArrayItemToolbarProps {
  legend: string
  index: number
  headerConfig: ArrayItemHeaderConfig
  itemValues: Record<string, unknown>
  watchedPrimary: unknown
  watchedSummaryContext?: Record<string, unknown>
  showDragHandle: boolean
  dragHandleProps?: ArrayItemDragHandleProps
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  titleId: string
  /** When true, only drag + title/fields render (compact inline row). */
  compact?: boolean
  issueSummary?: ArrayItemIssueSummaryProps
  children?: React.ReactNode
}

/** Leading chrome and title/compact fields — trailing actions live in `ArrayItemActionsRail`. */
export function ArrayItemToolbar({
  legend,
  index,
  headerConfig,
  itemValues,
  watchedPrimary,
  watchedSummaryContext,
  showDragHandle,
  dragHandleProps,
  collapsible,
  collapsed,
  onToggleCollapse,
  bodyId,
  titleId,
  compact = false,
  issueSummary,
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
    !compact && headerConfig.summary
      ? headerConfig.summary(itemValues, index, watchedSummaryContext)
      : undefined

  const gripVisible = showDragHandle && Boolean(dragHandleProps)
  const leadingChrome: ArrayItemLeadingChromeOptions = { showDragHandle: gripVisible, collapsible }

  const headerContentClasses = cn(
    arrayItemHeaderContentClasses,
    'min-w-0 flex-1',
    arrayItemToolbarContentClasses(leadingChrome),
  )

  const titleRow = (
    <ArrayItemTitleRow
      header={header}
      headerContentClasses={headerContentClasses}
      leadingChrome={leadingChrome}
      compact={compact}
      gripVisible={gripVisible}
      dragHandleProps={dragHandleProps}
      collapsible={collapsible}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      bodyId={bodyId}
      titleId={titleId}
    >
      {children}
    </ArrayItemTitleRow>
  )

  if (!summary && !issueSummary) return titleRow

  return (
    <div className={arrayItemHeaderShellClasses}>
      {titleRow}
      <ArrayItemHeaderExtras
        summary={summary}
        issueSummary={issueSummary}
        collapsed={collapsed}
        leadingChrome={leadingChrome}
      />
    </div>
  )
}
