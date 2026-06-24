const groupedNumberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 })

/**
 * Formats a number with en-US thousand separators. Values below 1,000 render
 * without grouping (e.g. 999 → "999", 3000 → "3,000").
 */
export function formatGroupedNumber(value: number): string {
  return groupedNumberFormatter.format(value)
}

/**
 * Parses a user-entered numeric string, stripping grouping separators.
 * Returns `undefined` for empty or invalid input.
 */
export function parseGroupedNumber(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (trimmed === '') return undefined
  const normalized = trimmed.replaceAll(',', '')
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? undefined : parsed
}
