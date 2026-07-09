'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'

import { cn } from '../../../lib/utils'
import { resolveCollapsibleListItemLeadingChrome } from './collapsible-list-item-leading-chrome.lib'
import {
  collapsibleListItemDraggingClasses,
  collapsibleListItemMainClasses,
  collapsibleListItemShellVariants,
  type CollapsibleListItemLeadingChromeOptions,
} from './collapsible-list-item.variants'

export type CollapsibleListItemShellTone = 'default' | 'subtle' | 'warning' | 'error'

export interface CollapsibleListItemShellProps extends CollapsibleListItemLeadingChromeOptions {
  titleId: string
  itemPrefix?: string
  dragging?: boolean
  layout?: 'default' | 'compactRow'
  tone?: CollapsibleListItemShellTone
  className?: string
  main: React.ReactNode
  actions?: React.ReactNode
}

/** Grid shell — main content column + trailing actions rail. */
export function CollapsibleListItemShell({
  titleId,
  itemPrefix,
  showDragHandle,
  collapsible,
  dragging = false,
  layout = 'default',
  tone = 'default',
  className,
  main,
  actions,
}: CollapsibleListItemShellProps) {
  const leadingChromeStyle = {
    '--array-item-chrome-count': resolveCollapsibleListItemLeadingChrome({
      showDragHandle,
      collapsible,
    }).chromeCount,
  } as CSSProperties

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      data-array-item-prefix={itemPrefix}
      className={cn(
        collapsibleListItemShellVariants({ tone, layout }),
        dragging && collapsibleListItemDraggingClasses,
        className,
      )}
      style={leadingChromeStyle}
    >
      {layout === 'compactRow' ? (
        main
      ) : (
        <>
          <div className={collapsibleListItemMainClasses}>{main}</div>
          {actions}
        </>
      )}
    </div>
  )
}
