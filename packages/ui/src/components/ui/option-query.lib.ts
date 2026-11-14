import { matchSearchDocumentQuery, scoreSearchDocument, type SearchDocument } from '@rpg/search'

import {
  buildPickerSearchFields,
  mapPickerFieldsToSearchDocument,
  resolveIncludeSupportingForCombobox,
  type PickerSearchOptions,
} from '../../lib/picker-search.lib'

export type { PickerSearchOptions }

export interface LabelValueMetadataOption {
  label: string
  value: string
  metadata?: string
  searchTerms?: readonly string[]
  aliases?: readonly string[]
  search?: PickerSearchOptions
}

const COMBOBOX_SEARCH_PROFILE = 'forgiving' as const

/** Maps ComboboxField options to `@rpg/search` documents (label → primary, value/searchTerms → keyword). */
export function assembleComboboxOptionSearchDocument(
  option: LabelValueMetadataOption,
): SearchDocument {
  const fields = buildPickerSearchFields({
    label: option.label,
    supportingText: option.metadata,
    searchTerms: option.searchTerms,
    aliases: option.aliases,
    includeSupporting: resolveIncludeSupportingForCombobox(option.search, Boolean(option.metadata)),
    valueSlug: option.value,
  })

  return mapPickerFieldsToSearchDocument(option.value, fields)
}

export function optionMatchesQuery(option: LabelValueMetadataOption, query: string): boolean {
  return matchSearchDocumentQuery(assembleComboboxOptionSearchDocument(option), query, {
    profile: COMBOBOX_SEARCH_PROFILE,
  }).matched
}

/** Scores one option against a query using the combobox forgiving profile. */
export function scoreOptionQuery(option: LabelValueMetadataOption, query: string): number {
  return scoreSearchDocument(assembleComboboxOptionSearchDocument(option), query, {
    profile: COMBOBOX_SEARCH_PROFILE,
  })
}

/**
 * Filters to matching options and ranks by `@rpg/search` score: label exact/prefix,
 * then label substring, then keyword/search-term matches. Ties preserve input order.
 */
export function rankOptionsByQuery<T extends LabelValueMetadataOption>(
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
