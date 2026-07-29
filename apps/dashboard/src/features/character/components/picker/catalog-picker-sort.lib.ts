import { isEmptySearchQuery, normalizeSearchQuery } from '@rpg/search'
import { chainComparators } from '@rpg/search/ranking'

export { chainComparators }

export function compareName(
  collator: Intl.Collator,
  leftName: string,
  rightName: string,
  direction: 'asc' | 'desc',
): number {
  return direction === 'asc'
    ? collator.compare(leftName, rightName)
    : collator.compare(rightName, leftName)
}

export function scoreAndFilterPickerItems<T>(
  items: readonly T[],
  options: {
    searchQuery: string
    scoreItem: (item: T, searchQuery: string) => number
  },
): Array<{ item: T; searchScore: number }> {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery)
  const scored = items.map((item) => ({
    item,
    searchScore: options.scoreItem(item, options.searchQuery),
  }))

  return isEmptySearchQuery(normalizedQuery) ? scored : scored.filter((row) => row.searchScore > 0)
}
