'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils'
import {
  DEFAULT_ARRAY_ITEM_SURFACE,
  resolveFieldContainerChromeClasses,
  type SemanticSurfaceTone,
} from '../field-surface.variants'
import type { SurfaceConfig } from '../visual-vocabulary.types'
import { buildCollapsibleListItemLeadingChromeStyle } from './collapsible-list-item-leading-chrome.lib'
import { CollapsibleListItemActions } from './collapsible-list-item-actions.client'
import {
  collapsibleListItemDraggingClasses,
  collapsibleListItemHeaderRowClasses,
  collapsibleListItemHeaderSummaryClasses,
  collapsibleListItemMainClasses,
  collapsibleListItemShellVariants,
  type CollapsibleListItemLeadingChromeOptions,
  type CollapsibleListItemShellPreset,
} from './collapsible-list-item.variants'

export type { CollapsibleListItemShellPreset } from './collapsible-list-item.variants'

export type CollapsibleListItemActionsAlign = 'start' | 'center'

export interface CollapsibleListItemShellProps extends CollapsibleListItemLeadingChromeOptions {
  titleId: string
  itemPrefix?: string
  dragging?: boolean
  layout?: 'default' | 'compactRow'
  actionsAlign?: CollapsibleListItemActionsAlign
  /** Non-form shell presets — bypass surface/tone axes. */
  preset?: CollapsibleListItemShellPreset
  surface?: SurfaceConfig
  tone?: SemanticSurfaceTone
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
  tone,
}: Pick<CollapsibleListItemShellProps, 'preset' | 'surface' | 'tone'>): string {
  if (preset === 'catalog') {
    return ''
  }
  if (preset === 'default' && surface === undefined && tone === undefined) {
    return 'border-border'
  }
  return resolveFieldContainerChromeClasses(
    { surface: surface ?? DEFAULT_ARRAY_ITEM_SURFACE, tone },
    { surface: DEFAULT_ARRAY_ITEM_SURFACE },
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
  tone,
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

  const leadingChromeStyle = buildCollapsibleListItemLeadingChromeStyle(leadingChrome)

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
  const chromeClasses = resolveShellChromeClasses({ preset, surface, tone })

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      data-array-item-prefix={itemPrefix}
      className={cn(
        collapsibleListItemShellVariants({ layout: shellLayout, preset }),
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
