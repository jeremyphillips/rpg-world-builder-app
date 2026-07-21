import { normalizeSearchQuery } from '@rpg/ui'

export function chainComparators<T>(
  ...fns: Array<(left: T, right: T) => number>
): (left: T, right: T) => number {
  return (left, right) => {
    for (const compare of fns) {
      const diff = compare(left, right)
      if (diff !== 0) return diff
    }
    return 0
  }
}

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

  return normalizedQuery ? scored.filter((row) => row.searchScore > 0) : scored
}
