import type { ReactNode } from 'react'

import { formatOverviewResultLabel } from './overview-selection-cluster.lib'
import {
  overviewResultSummaryDotVariants,
  overviewResultSummaryPipeVariants,
  overviewResultSummaryVariants,
} from './overview-result-summary.variants'

export type OverviewResultSummaryProps = {
  resultCount: number
  resultLabel?: string
  supplementalContent?: ReactNode
}

/** Middle-dot separator before Show/Hide actions in supplemental disclosure rows. */
export function OverviewResultSummaryDotSeparator() {
  return (
    <span aria-hidden className={overviewResultSummaryDotVariants()}>
      ·
    </span>
  )
}

/** Shared overview result count with optional supplemental disclosure content. */
export function OverviewResultSummary({
  resultCount,
  resultLabel,
  supplementalContent,
}: OverviewResultSummaryProps) {
  const label = resultLabel ?? formatOverviewResultLabel(resultCount)

  return (
    <div className={overviewResultSummaryVariants()}>
      <span role="status" aria-live="polite" aria-atomic="true" className="tabular-nums">
        {label}
      </span>
      {supplementalContent ? (
        <>
          <span aria-hidden className={overviewResultSummaryPipeVariants()}>
            |
          </span>
          {supplementalContent}
        </>
      ) : null}
    </div>
  )
}
