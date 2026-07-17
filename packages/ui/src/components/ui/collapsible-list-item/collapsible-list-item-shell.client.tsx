'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

import { cn } from '../../../lib/utils'
import {
  resolveFieldContainerChromeClasses,
  type FieldStatusTone,
  type FieldSurfaceVariant,
} from '../field-surface.variants'
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

export type CollapsibleListItemShellPreset = 'default' | 'catalog'

export type CollapsibleListItemActionsAlign = 'start' | 'center'

export interface CollapsibleListItemShellProps extends CollapsibleListItemLeadingChromeOptions {
  titleId: string
  itemPrefix?: string
  dragging?: boolean
  layout?: 'default' | 'compactRow'
  actionsAlign?: CollapsibleListItemActionsAlign
  /** Non-form shell presets — bypass surface/status axes. */
  preset?: CollapsibleListItemShellPreset
  surface?: FieldSurfaceVariant
  status?: FieldStatusTone
  className?: string
  toolbar?: React.ReactNode
  body?: React.ReactNode
  summary?: React.ReactNode
  main?: React.ReactNode
  actions?: React.ReactNode
}

function resolveShellChromeClasses({
  preset = 'default',
  surface,
  status,
}: Pick<CollapsibleListItemShellProps, 'preset' | 'surface' | 'status'>): string {
  if (preset === 'catalog') {
    return 'border-border bg-catalog-picker-row-surface'
  }
  if (preset === 'default' && surface === undefined && status === undefined) {
    return 'border-border'
  }
  return resolveFieldContainerChromeClasses(
    { surface: surface ?? 'raised', status },
    { surface: 'raised' },
  )
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
  preset = 'default',
  surface,
  status,
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
  const chromeClasses = resolveShellChromeClasses({ preset, surface, status })

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      data-array-item-prefix={itemPrefix}
      className={cn(
        collapsibleListItemShellVariants({ layout: shellLayout }),
        chromeClasses,
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
