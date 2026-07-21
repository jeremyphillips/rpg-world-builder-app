import { normalizeSearchQuery } from '@rpg/ui'

/** Show search once a detail catalog list is large enough to benefit from it. */
export const CHARACTER_DETAIL_CATALOG_SEARCH_MIN_ITEMS = 6

export function matchesCharacterDetailCatalogSearchQuery(
  card: { displayName: string },
  normalizedQuery: string,
): boolean {
  if (normalizedQuery.length === 0) return true
  return normalizeSearchQuery(card.displayName).includes(normalizedQuery)
}

export function countCharacterDetailStructuredFilters<T extends string>(
  selectedValue: T,
  allSentinel: T,
): number {
  return selectedValue === allSentinel ? 0 : 1
}
