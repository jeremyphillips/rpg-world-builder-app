import { matchSearchDocumentQuery, scoreSearchDocument, type SearchDocument } from '@rpg/search'

export interface LabelValueDescriptionOption {
  label: string
  value: string
  description?: string
  searchTerms?: readonly string[]
}

const COMBOBOX_SEARCH_PROFILE = 'forgiving' as const

/** Maps ComboboxField options to `@rpg/search` documents (label → primary, value/searchTerms → keyword). */
export function assembleComboboxOptionSearchDocument(
  option: LabelValueDescriptionOption,
): SearchDocument {
  const fields = [
    { key: 'label', text: option.label, role: 'primary' as const },
    { key: 'value', text: option.value, role: 'keyword' as const },
    ...(option.description
      ? [{ key: 'description', text: option.description, role: 'secondary' as const }]
      : []),
    ...(option.searchTerms?.map((term, index) => ({
      key: `searchTerm-${index}`,
      text: term,
      role: 'keyword' as const,
    })) ?? []),
  ]

  return { id: option.value, fields }
}

export function optionMatchesQuery(option: LabelValueDescriptionOption, query: string): boolean {
  return matchSearchDocumentQuery(assembleComboboxOptionSearchDocument(option), query, {
    profile: COMBOBOX_SEARCH_PROFILE,
  }).matched
}

/** Scores one option against a query using the combobox forgiving profile. */
export function scoreOptionQuery(option: LabelValueDescriptionOption, query: string): number {
  return scoreSearchDocument(assembleComboboxOptionSearchDocument(option), query, {
    profile: COMBOBOX_SEARCH_PROFILE,
  })
}

/**
 * Filters to matching options and ranks by `@rpg/search` score: label exact/prefix,
 * then label substring, then keyword/search-term matches. Ties preserve input order.
 */
export function rankOptionsByQuery<T extends LabelValueDescriptionOption>(
  options: readonly T[],
  query: string,
): T[] {
  const normalized = query.trim()
  if (!normalized) return [...options]

  return [...options]
    .map((option, index) => ({
      option,
      index,
      score: scoreOptionQuery(option, query),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.option)
}
