'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

import { cn } from '../../../lib/utils'
import { resolveCollapsibleListItemLeadingChrome } from './collapsible-list-item-leading-chrome.lib'
import { CollapsibleListItemActions } from './collapsible-list-item-actions.client'
import {
  collapsibleListItemDraggingClasses,
  collapsibleListItemHeaderRowClasses,
  collapsibleListItemHeaderSummaryClasses,
  collapsibleListItemMainClasses,
  collapsibleListItemShellVariants,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item.variants'

export type CollapsibleListItemShellTone =
  | 'default'
  | 'main'
  | 'elevated'
  | 'subtle'
  | 'medium'
  | 'warning'
  | 'error'
  | 'catalog'

export type CollapsibleListItemActionsAlign = 'start' | 'center'

export interface CollapsibleListItemShellProps extends CollapsibleListItemLeadingChromeOptions {
  titleId: string
  itemPrefix?: string
  dragging?: boolean
  layout?: 'default' | 'compactRow'
  actionsAlign?: CollapsibleListItemActionsAlign
  tone?: CollapsibleListItemShellTone
  className?: string
  /** Preferred — toolbar/header row only. */
  toolbar?: React.ReactNode
  /** Expanded content below the header row. */
  body?: React.ReactNode
  /** Summary below the header row when actions center on the title row only. */
  summary?: React.ReactNode
  /** Legacy combined toolbar + body (array items). */
  main?: React.ReactNode
  actions?: React.ReactNode
}

/** Grid shell — toolbar row + optional body + trailing actions rail. */
export function CollapsibleListItemShell({
  titleId,
  itemPrefix,
  showDragHandle,
  collapsible,
  dragging = false,
  layout = 'default',
  actionsAlign = 'start',
  tone = 'default',
  className,
  toolbar,
  body,
  summary,
  main,
  actions,
}: CollapsibleListItemShellProps) {
  const leadingChrome: CollapsibleListItemLeadingChromeOptions = {
    showDragHandle,
    collapsible,
  }

  const leadingChromeStyle = {
    '--array-item-chrome-count': resolveCollapsibleListItemLeadingChrome(leadingChrome).chromeCount,
  } as CSSProperties

  const shellLayout =
    layout === 'compactRow' ? 'compactRow' : actionsAlign === 'center' ? 'headerActions' : 'default'
  const resolvedToolbar = toolbar ?? main
  const resolvedBody = toolbar !== undefined ? body : undefined
  const resolvedActions =
    actions && actionsAlign === 'center' ? (
      <CollapsibleListItemActions centered>{actions}</CollapsibleListItemActions>
    ) : (
      actions
    )

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      data-array-item-prefix={itemPrefix}
      className={cn(
        collapsibleListItemShellVariants({ tone, layout: shellLayout }),
        dragging && collapsibleListItemDraggingClasses,
        className,
      )}
      style={leadingChromeStyle}
    >
      {layout === 'compactRow' ? (
        resolvedToolbar
      ) : actionsAlign === 'center' ? (
        <>
          <div className={collapsibleListItemHeaderRowClasses}>
            <div className="min-w-0 flex-1">{resolvedToolbar}</div>
            {resolvedActions}
          </div>
          {summary ? (
            <div className={collapsibleListItemHeaderSummaryClasses(leadingChrome)}>{summary}</div>
          ) : null}
          {resolvedBody}
        </>
      ) : (
        <>
          <div className={collapsibleListItemMainClasses}>
            {resolvedToolbar}
            {resolvedBody}
          </div>
          {actions}
        </>
      )}
    </div>
  )
}
