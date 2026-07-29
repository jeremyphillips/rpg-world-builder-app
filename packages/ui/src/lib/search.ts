import { classifyMatchTier, normalizeSearchQuery as normalizeSearchQueryCore } from '@rpg/search'

import { rankLegacySearchItems, scoreLegacySearchItem } from './search-document.lib'

export type SearchFieldRole = 'label' | 'alias' | 'keyword' | 'description' | 'group'

export type MatchTier = 'exact' | 'prefix' | 'substring' | 'none'

export type WeightedSearchField = {
  text: string
  weight: number
  role: SearchFieldRole
}

export type SearchableItem = {
  fields: WeightedSearchField[]
}

/** Normalizes free-text queries for case-insensitive matching. */
export function normalizeSearchQuery(query: string): string {
  return normalizeSearchQueryCore(query).text
}

/** Classifies how `text` matches `query`. */
export function matchTier(text: string, query: string): MatchTier {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return 'none'

  return classifyMatchTier(text, normalizedQuery)
}

/** Scores one weighted field against a query. */
export function scoreField(field: WeightedSearchField, query: string): number {
  return scoreLegacySearchItem({ fields: [field] }, query, 'literal')
}

/** Returns the highest field score for an item. */
export function scoreItem(item: SearchableItem, query: string): number {
  return scoreLegacySearchItem(item, query, 'literal')
}

/** Filters to score > 0 and sorts by score descending; ties keep input order. */
export function rankItems<T extends SearchableItem>(items: T[], query: string): T[] {
  return rankLegacySearchItems(items, query, 'literal')
}

export {
  assembleLegacySearchDocument,
  mapLegacySearchField,
  matchesLegacySearchItem,
  matchesPrimaryTextQuery,
  rankLegacySearchItems,
  scoreLegacySearchItem,
} from './search-document.lib'
