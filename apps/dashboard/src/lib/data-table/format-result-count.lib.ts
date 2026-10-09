/** Visible-count segment shared by result summaries. */
export function formatResultCount(count: number): string {
  return count === 1 ? '1 result' : `${count} results`
}

/**
 * Every count the summary can show for an eligible list.
 * Glyph width is not monotonic (`999 results` can be wider than `1000 results`),
 * so the toolbar sizer measures this whole set.
 */
export function resultCountSizerLabels(total: number): string[] {
  const upper = Math.max(0, total)
  const labels: string[] = []
  for (let count = 0; count <= upper; count += 1) {
    labels.push(formatResultCount(count))
  }
  return labels
}
