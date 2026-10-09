import { overviewResultSummaryDotVariants } from './overview-result-summary.variants'

/** Middle-dot separator for surfaces that are not a result summary. */
export function OverviewResultSummaryDotSeparator() {
  return (
    <span aria-hidden className={overviewResultSummaryDotVariants()}>
      ·
    </span>
  )
}
