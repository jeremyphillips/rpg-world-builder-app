'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils'
import { CollapsibleListItemActions } from './collapsible-list-item-actions.client'
import {
  collapsibleListItemHeaderRowClassesForRowLayout,
  collapsibleListItemHeaderStackClasses,
  collapsibleListItemHeaderStackSummaryGapClasses,
  collapsibleListItemHeaderSummaryClasses,
  collapsibleListItemHeaderVerticalPaddingVariants,
  collapsibleListItemMainClasses,
  type CollapsibleListItemDensity,
  type CollapsibleListItemLeadingChromeOptions,
  type CollapsibleListItemRowLayout,
} from './collapsible-list-item.variants'
import type { CollapsibleListItemHeaderActionsPlacement } from './collapsible-list-item-root.lib'

interface CollapsibleListItemShellContentProps {
  layout: 'default' | 'compactRow'
  headerActionsPlacement: CollapsibleListItemHeaderActionsPlacement
  rowLayout: CollapsibleListItemRowLayout
  density: CollapsibleListItemDensity
  leadingChrome: CollapsibleListItemLeadingChromeOptions
  toolbar: React.ReactNode
  body?: React.ReactNode
  summary?: React.ReactNode
  actions?: React.ReactNode
}

function CollapsibleListItemCenterActionsContent({
  headerRowClasses,
  rowLayout,
  density,
  leadingChrome,
  toolbar,
  summary,
  actions,
  body,
}: {
  headerRowClasses: string
  rowLayout: CollapsibleListItemRowLayout
  density: CollapsibleListItemDensity
  leadingChrome: CollapsibleListItemLeadingChromeOptions
  toolbar: React.ReactNode
  summary?: React.ReactNode
  actions?: React.ReactNode
  body?: React.ReactNode
}) {
  const headerRowPadding =
    rowLayout === 'entity-card'
      ? undefined
      : leadingChrome.collapsible
        ? collapsibleListItemHeaderVerticalPaddingVariants({ density })
        : undefined

  return (
    <>
      <div className={cn(headerRowClasses, headerRowPadding)}>
        <div
          className={cn(
            collapsibleListItemHeaderStackClasses,
            summary && collapsibleListItemHeaderStackSummaryGapClasses,
            'min-w-0 flex-1',
          )}
        >
          {toolbar}
          {summary ? (
            <div className={collapsibleListItemHeaderSummaryClasses(leadingChrome)}>{summary}</div>
          ) : null}
        </div>
        {actions}
      </div>
      {body}
    </>
  )
}

export function CollapsibleListItemShellContent({
  layout,
  headerActionsPlacement,
  rowLayout,
  density,
  leadingChrome,
  toolbar,
  body,
  summary,
  actions,
}: CollapsibleListItemShellContentProps) {
  const headerRowClasses = collapsibleListItemHeaderRowClassesForRowLayout(rowLayout)
  const resolvedActions =
    actions && headerActionsPlacement === 'center' ? (
      <CollapsibleListItemActions centered>{actions}</CollapsibleListItemActions>
    ) : (
      actions
    )

  if (layout === 'compactRow') {
    return toolbar
  }

  if (headerActionsPlacement === 'center') {
    return (
      <CollapsibleListItemCenterActionsContent
        headerRowClasses={headerRowClasses}
        rowLayout={rowLayout}
        density={density}
        leadingChrome={leadingChrome}
        toolbar={toolbar}
        summary={summary}
        actions={resolvedActions}
        body={body}
      />
    )
  }

  return (
    <>
      <div className={collapsibleListItemMainClasses}>
        {toolbar}
        {body}
      </div>
      {actions}
    </>
  )
}
