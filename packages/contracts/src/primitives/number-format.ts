const groupedNumberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 })

const UNICODE_HALF = '½'

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

/** Replaces unicode fraction glyphs with decimal equivalents for parsing. */
export function normalizeUnicodeFractions(raw: string): string {
  return raw.replaceAll(UNICODE_HALF, '.5')
}

/**
 * Formats a numeric value, rendering 0.5 as "1/2" and n.5 as "n½".
 * Whole values use grouped number formatting when >= 1,000.
 */
export function formatFractionalNumber(value: number): string {
  const whole = Math.floor(value)
  const frac = value - whole
  if (frac === 0) return formatGroupedNumber(whole)
  if (frac === 0.5) {
    if (whole === 0) return '1/2'
    return `${formatGroupedNumber(whole)}${UNICODE_HALF}`
  }
  return formatGroupedNumber(value)
}

/**
 * Parses a numeric string that may include unicode half fractions and grouping.
 * Returns `undefined` for empty or invalid input.
 */
export function parseFractionalNumber(raw: string): number | undefined {
  const normalized = normalizeUnicodeFractions(raw.trim()).replaceAll(',', '')
  if (normalized === '') return undefined
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? undefined : parsed
}
