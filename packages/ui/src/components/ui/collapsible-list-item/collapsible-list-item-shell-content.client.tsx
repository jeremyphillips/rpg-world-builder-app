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
import type { CollapsibleListItemActionsAlign } from './collapsible-list-item-shell.client'

interface CollapsibleListItemShellContentProps {
  layout: 'default' | 'compactRow'
  actionsAlign: CollapsibleListItemActionsAlign
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
  density,
  leadingChrome,
  toolbar,
  summary,
  actions,
  body,
}: {
  headerRowClasses: string
  density: CollapsibleListItemDensity
  leadingChrome: CollapsibleListItemLeadingChromeOptions
  toolbar: React.ReactNode
  summary?: React.ReactNode
  actions?: React.ReactNode
  body?: React.ReactNode
}) {
  const headerRowPadding = leadingChrome.collapsible
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
  actionsAlign,
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
    actions && actionsAlign === 'center' ? (
      <CollapsibleListItemActions centered>{actions}</CollapsibleListItemActions>
    ) : (
      actions
    )

  if (layout === 'compactRow') {
    return toolbar
  }

  if (actionsAlign === 'center') {
    return (
      <CollapsibleListItemCenterActionsContent
        headerRowClasses={headerRowClasses}
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
