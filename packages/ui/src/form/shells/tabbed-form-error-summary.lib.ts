/** Joins tab labels for the validation summary sentence. */
export function formatTabLabelList(labels: readonly string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]!
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`
}

export function buildTabbedFormErrorSummaryMessage(invalidTabLabels: readonly string[]): string {
  return `Some fields need attention. Errors were found in ${formatTabLabelList(invalidTabLabels)}.`
}

export function buildTabbedFormReviewLabel(tabLabel: string): string {
  return `Review ${tabLabel}`
}
