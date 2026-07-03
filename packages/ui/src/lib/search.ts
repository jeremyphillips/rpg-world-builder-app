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

const ROLE_TIER_SCORES: Record<SearchFieldRole, Partial<Record<MatchTier, number>>> = {
  label: { exact: 100, prefix: 100, substring: 80 },
  alias: { exact: 70, prefix: 70, substring: 55 },
  keyword: { exact: 35, prefix: 35, substring: 20 },
  description: { substring: 10 },
  group: { substring: 5 },
}

/** Normalizes free-text queries for case-insensitive matching. */
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

/** Classifies how `text` matches `query`. */
export function matchTier(text: string, query: string): MatchTier {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return 'none'

  const normalizedText = text.toLowerCase()
  if (normalizedText === normalizedQuery) return 'exact'
  if (normalizedText.startsWith(normalizedQuery)) return 'prefix'
  if (normalizedText.includes(normalizedQuery)) return 'substring'
  return 'none'
}

/** Scores one weighted field against a query. */
export function scoreField(field: WeightedSearchField, query: string): number {
  const tier = matchTier(field.text, query)
  if (tier === 'none') return 0

  const roleScores = ROLE_TIER_SCORES[field.role]
  const baseScore = roleScores[tier] ?? (tier === 'substring' ? undefined : roleScores.substring)
  if (baseScore === undefined) return 0
  return baseScore * field.weight
}

/** Returns the highest field score for an item. */
export function scoreItem(item: SearchableItem, query: string): number {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return 0

  let maxScore = 0
  for (const field of item.fields) {
    maxScore = Math.max(maxScore, scoreField(field, normalizedQuery))
  }
  return maxScore
}

/** Filters to score > 0 and sorts by score descending; ties keep input order. */
export function rankItems<T extends SearchableItem>(items: T[], query: string): T[] {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return [...items]

  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.item)
}
