/**
 * English prose primitives for generated sentences — list joining, clause glue, etc.
 * Domain vocabulary and counted noun phrases live in `vocab/`; money in `wealth.ts`.
 */

/** Oxford-comma list: "a", "a and b", "a, b, and c". */
export function joinNaturalList(items: readonly string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}
