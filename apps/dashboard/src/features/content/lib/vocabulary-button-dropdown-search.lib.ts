import type { WeightedSearchField } from '@rpg/ui'

/** Maps contracts vocabulary `searchTerms` to ButtonDropdown keyword fields. */
export function mapVocabularySearchTermsToWeightedFields(
  terms: readonly string[],
): WeightedSearchField[] {
  return terms.map((text) => ({ text, weight: 1, role: 'keyword' as const }))
}
