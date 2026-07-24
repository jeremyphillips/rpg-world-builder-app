export type OverviewResultCountInput = {
  /** Rows shown after all filters (including campaign availability). */
  filteredCount: number
  /** Rows matching filters except campaign availability. */
  availabilityScopedCount: number
  /** Rows visible to the viewer after discovery policy. */
  totalCount: number
}

export function formatOverviewResultCount({
  filteredCount,
  availabilityScopedCount,
}: OverviewResultCountInput): string {
  if (filteredCount === availabilityScopedCount) {
    return filteredCount === 1 ? '1 result' : `${filteredCount} results`
  }

  const scopeLabel =
    availabilityScopedCount === 1 ? '1 result' : `${availabilityScopedCount} results`
  return `${filteredCount} of ${scopeLabel}`
}
