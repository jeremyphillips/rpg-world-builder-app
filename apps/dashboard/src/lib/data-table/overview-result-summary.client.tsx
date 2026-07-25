'use client'

import type { ReactNode } from 'react'

import { formatOverviewResultLabel } from './overview-selection-cluster.lib'

export type OverviewResultSummaryProps = {
  resultCount: number
  resultLabel?: string
  supplementalContent?: ReactNode
}

/** Shared overview result count with optional supplemental disclosure content. */
export function OverviewResultSummary({
  resultCount,
  resultLabel,
  supplementalContent,
}: OverviewResultSummaryProps) {
  const label = resultLabel ?? formatOverviewResultLabel(resultCount)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <span role="status" aria-live="polite" aria-atomic="true" className="tabular-nums">
        {label}
      </span>
      {supplementalContent}
    </div>
  )
}
