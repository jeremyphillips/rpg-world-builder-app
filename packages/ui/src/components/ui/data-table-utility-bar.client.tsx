'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

export type DataTableUtilityBarProps = {
  summary?: ReactNode
  leadingActions?: ReactNode
  trailingActions?: ReactNode
  /** Structural inset aligning leading actions with a leading table column (e.g. selection checkbox). */
  leadingInset?: string
  className?: string
}

function hasRenderableContent(node: ReactNode): boolean {
  return node != null && node !== false
}

export function DataTableUtilityBar({
  summary,
  leadingActions,
  trailingActions,
  leadingInset,
  className,
}: DataTableUtilityBarProps) {
  const showSummaryRow = hasRenderableContent(summary)
  const showActionsRow =
    hasRenderableContent(leadingActions) || hasRenderableContent(trailingActions)

  if (!showSummaryRow && !showActionsRow) {
    return null
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {showSummaryRow ? (
        <div className="ui-data-table__utility-summary text-style-supporting">{summary}</div>
      ) : null}
      {showActionsRow ? (
        <div className={cn('ui-data-table__utility-actions', borderStrength())}>
          {hasRenderableContent(leadingActions) ? (
            <div
              className="flex min-w-0 flex-wrap items-center gap-2"
              style={leadingInset ? { paddingInlineStart: leadingInset } : undefined}
            >
              {leadingActions}
            </div>
          ) : null}
          {hasRenderableContent(trailingActions) ? (
            <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
              {trailingActions}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
