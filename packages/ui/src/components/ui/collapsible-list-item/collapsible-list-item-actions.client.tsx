'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils'
import { collapsibleListItemActionsRailClasses } from './collapsible-list-item.variants'

export interface CollapsibleListItemActionsProps {
  compact?: boolean
  embedded?: boolean
  centered?: boolean
  className?: string
  children: React.ReactNode
}

/** Top-right action cluster slot for one list item row. */
export function CollapsibleListItemActions({
  compact = false,
  embedded = false,
  centered = false,
  className,
  children,
}: CollapsibleListItemActionsProps) {
  return (
    <div
      role="group"
      aria-label="Item actions"
      className={cn(
        collapsibleListItemActionsRailClasses({ compact, embedded, centered }),
        className,
      )}
    >
      {children}
    </div>
  )
}
