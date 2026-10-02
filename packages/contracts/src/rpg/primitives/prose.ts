/**
 * English prose primitives for generated sentences — list joining, clause glue, etc.
 * Domain vocabulary and counted noun phrases live in `vocab/`; money in `wealth.ts`.
 */

export type JoinNaturalListOptions = {
  conjunction?: 'and' | 'or'
}

/** Oxford-comma list: "a", "a and b", "a, b, and c" (or "or" variant). */
export function joinNaturalList(
  items: readonly string[],
  options: JoinNaturalListOptions = {},
): string {
  const conjunction = options.conjunction ?? 'and'
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items.at(-1)}`
}

/** English ordinal suffix for integers (1 → 1st, 11 → 11th). */
export function formatOrdinal(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  const mod10 = n % 10
  if (mod10 === 1) return `${n}st`
  if (mod10 === 2) return `${n}nd`
  if (mod10 === 3) return `${n}rd`
  return `${n}th`
}
