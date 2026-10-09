/** Locale used for result-count digits (grouping only; copy stays English). */
const RESULT_COUNT_NUMBER_FORMAT = new Intl.NumberFormat('en-US')

/** Shared typography for digits in result summaries and toolbar sizer ghosts. */
export const RESULT_COUNT_TABULAR_CLASSES = 'tabular-nums' as const

function formatResultCountNumber(count: number): string {
  return RESULT_COUNT_NUMBER_FORMAT.format(count)
}

/** Visible-count segment shared by result summaries. */
export function formatResultCount(count: number): string {
  const formatted = formatResultCountNumber(count)
  return count === 1 ? `${formatted} result` : `${formatted} results`
}

/**
 * Representative labels for `FilterToolbarLabelSizer` (at most two).
 * With {@link RESULT_COUNT_TABULAR_CLASSES}, the singular label and the
 * eligible-total plural label bound width for every count from 0 through total.
 */
export function resultCountSizerLabels(total: number): readonly string[] {
  const upper = Math.max(0, Math.floor(total))
  if (upper === 0) return [formatResultCount(0)]
  if (upper === 1) return [formatResultCount(0), formatResultCount(1)]
  return [formatResultCount(1), formatResultCount(upper)]
}

/** Longest reserved label length — proxy for tabular width under a fixed font. */
export function maxResultCountSizerLabelLength(labels: readonly string[]): number {
  return labels.reduce((max, label) => Math.max(max, label.length), 0)
}
