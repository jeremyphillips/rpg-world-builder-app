'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  dataTableUtilityBarActionsRowVariants,
  dataTableUtilityBarLeadingVariants,
  dataTableUtilityBarSummaryRowVariants,
  dataTableUtilityBarTrailingVariants,
  dataTableUtilityBarVariants,
} from './data-table-utility-bar.variants'

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
    <div className={cn(dataTableUtilityBarVariants(), className)}>
      {showSummaryRow ? (
        <div className={dataTableUtilityBarSummaryRowVariants()}>{summary}</div>
      ) : null}
      {showActionsRow ? (
        <div className={dataTableUtilityBarActionsRowVariants()}>
          {hasRenderableContent(leadingActions) ? (
            <div
              className={dataTableUtilityBarLeadingVariants()}
              style={leadingInset ? { paddingInlineStart: leadingInset } : undefined}
            >
              {leadingActions}
            </div>
          ) : null}
          {hasRenderableContent(trailingActions) ? (
            <div className={dataTableUtilityBarTrailingVariants()}>{trailingActions}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
