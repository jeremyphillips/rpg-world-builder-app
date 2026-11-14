'use client'

import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { ArrayItemIssueSummary } from './array-item-issue.client'

export function ArrayItemIssueSummaries({
  summaries,
  className,
}: {
  summaries: readonly ArrayItemIssueSummaryProps[]
  className?: string
}) {
  if (summaries.length === 0) return null

  return (
    <>
      {summaries.map((summary) => (
        <ArrayItemIssueSummary
          key={summary.placement ?? summary.summaryId}
          {...summary}
          className={className}
        />
      ))}
    </>
  )
}
