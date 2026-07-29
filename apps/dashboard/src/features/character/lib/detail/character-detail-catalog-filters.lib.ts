import { matchesPrimaryTextQuery } from '@rpg/ui/lib/search-document'

/** Show search once a detail catalog list is large enough to benefit from it. */
export const CHARACTER_DETAIL_CATALOG_SEARCH_MIN_ITEMS = 6

export function matchesCharacterDetailCatalogSearchQuery(
  card: { displayName: string },
  query: string,
): boolean {
  return matchesPrimaryTextQuery(card.displayName, query, 'forgiving')
}

export function countCharacterDetailStructuredFilters<T extends string>(
  selectedValue: T,
  allSentinel: T,
): number {
  return selectedValue === allSentinel ? 0 : 1
}
