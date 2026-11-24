'use client'

import * as React from 'react'
import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

import { cn } from '../../../../lib/utils'
import {
  CollapsibleListItemCollapseButton,
  CollapsibleListItemDragHandle,
} from '../../../../components/ui/collapsible-list-item/collapsible-list-item-toolbar.client'
import type { ArrayItemHeaderConfig } from '../../../field-config'
import { InlineMetadata } from '../../../../components/ui/inline-metadata'
import {
  resolveArrayItemHeaderLabels,
  type ResolvedArrayItemHeader,
} from '../../../config/array/array-item-config.lib'
import { useFormSectionContext } from '../../../context/form-section.context'
import {
  arrayItemChromeColumnClasses,
  arrayItemHeaderContentClasses,
  arrayItemHeaderFallbackClasses,
  arrayItemHeaderShellClasses,
  arrayItemHeaderSummaryClasses,
  arrayItemHeaderSummaryIndentClasses,
  arrayItemHeaderTitleClasses,
  arrayItemToolbarContentClasses,
  arrayItemToolbarRowClasses,
  type ArrayItemLeadingChromeOptions,
} from './array-item-toolbar.variants'
import type { ArrayItemIssueSummaryProps } from './issues/array-item-issue.client'
import { ArrayItemIssueSummaries } from './issues/array-item-issue-summaries.client'

export interface ArrayItemDragHandleProps {
  ariaLabel: string
  attributes: DraggableAttributes
  listeners: SyntheticListenerMap | undefined
  compact?: boolean
  className?: string
}

export function ArrayItemDragHandle(props: ArrayItemDragHandleProps) {
  return <CollapsibleListItemDragHandle {...props} />
}

export function renderArrayItemTitleLine(
  header: ResolvedArrayItemHeader,
  metadataDensity: 'compact' | 'comfortable' = 'comfortable',
): React.ReactNode {
  if (header.primary) {
    return (
      <InlineMetadata role="heading" density={metadataDensity} wrap={false}>
        <InlineMetadata.Item>{header.primary}</InlineMetadata.Item>
        {header.showFallbackInTitle ? (
          <InlineMetadata.Item className={arrayItemHeaderFallbackClasses}>
            {header.fallback}
          </InlineMetadata.Item>
        ) : null}
      </InlineMetadata>
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
  const { density } = useFormSectionContext()
  const metadataDensity = density === 'compact' ? 'compact' : 'comfortable'
  if (compact) {
    return (
      <>
        {!gripVisible && !collapsible ? <span className="sr-only">{header.ariaLabel}</span> : null}
        {children}
      </>
    )
  }

  if (header.srOnly) return <span className="sr-only">{header.ariaLabel}</span>

  return (
    <div className={arrayItemHeaderTitleClasses}>
      {renderArrayItemTitleLine(header, metadataDensity)}
    </div>
  )
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

export interface ArrayItemHeaderContentProps {
  header: ResolvedArrayItemHeader
}

/** Visible title line for detailed array items — grip/caret live in CollapsibleListItemToolbar. */
export function ArrayItemHeaderContent({ header }: ArrayItemHeaderContentProps) {
  const { density } = useFormSectionContext()
  const metadataDensity = density === 'compact' ? 'compact' : 'comfortable'
  if (header.srOnly) return <span className="sr-only">{header.ariaLabel}</span>

  return (
    <div className={arrayItemHeaderTitleClasses}>
      {renderArrayItemTitleLine(header, metadataDensity)}
    </div>
  )
}

export interface ArrayItemHeaderSummaryProps {
  summary?: string
  issueSummaries?: readonly ArrayItemIssueSummaryProps[]
  collapsed: boolean
  leadingChrome: ArrayItemLeadingChromeOptions
  /** When true, summary lines include toolbar-column indent (stuffed-main shell path). */
  indentSummary?: boolean
}

export function ArrayItemHeaderSummary({
  summary,
  issueSummaries = [],
  collapsed: _collapsed,
  leadingChrome,
  indentSummary = false,
}: ArrayItemHeaderSummaryProps) {
  if (!summary && issueSummaries.length === 0) return null

  const summaryIndent = indentSummary
    ? arrayItemHeaderSummaryIndentClasses(leadingChrome)
    : undefined

  return (
    <>
      <ArrayItemIssueSummaries summaries={issueSummaries} className={summaryIndent} />
      {summary ? (
        <p className={cn(arrayItemHeaderSummaryClasses, summaryIndent)}>{summary}</p>
      ) : null}
    </>
  )
}

interface ArrayItemHeaderExtrasProps {
  summary?: string
  issueSummaries?: readonly ArrayItemIssueSummaryProps[]
  collapsed: boolean
  leadingChrome: ArrayItemLeadingChromeOptions
}

function ArrayItemHeaderExtras({
  summary,
  issueSummaries,
  collapsed,
  leadingChrome,
}: ArrayItemHeaderExtrasProps) {
  return (
    <ArrayItemHeaderSummary
      summary={summary}
      issueSummaries={issueSummaries}
      collapsed={collapsed}
      leadingChrome={leadingChrome}
      indentSummary
    />
  )
}

export interface ArrayItemToolbarProps {
  legend: string
  index: number
  headerConfig: ArrayItemHeaderConfig
  itemValues: Record<string, unknown>
  watchedPrimary: unknown
  watchedSummaryContext?: Record<string, unknown>
  reserveDragHandleSlot: boolean
  dragHandleProps?: ArrayItemDragHandleProps
  collapsible: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  bodyId: string
  titleId: string
  /** When true, only drag + title/fields render (compact inline row). */
  compact?: boolean
  issueSummaries?: readonly ArrayItemIssueSummaryProps[]
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
  reserveDragHandleSlot,
  dragHandleProps,
  collapsible,
  collapsed,
  onToggleCollapse,
  bodyId,
  titleId,
  compact = false,
  issueSummaries = [],
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

  const gripVisible = reserveDragHandleSlot && Boolean(dragHandleProps)
  const leadingChrome: ArrayItemLeadingChromeOptions = {
    reserveDragHandleSlot: gripVisible,
    collapsible,
  }

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

  if (!summary && issueSummaries.length === 0) return titleRow

  return (
    <div className={arrayItemHeaderShellClasses}>
      {titleRow}
      <ArrayItemHeaderExtras
        summary={summary}
        issueSummaries={issueSummaries}
        collapsed={collapsed}
        leadingChrome={leadingChrome}
      />
    </div>
  )
}
