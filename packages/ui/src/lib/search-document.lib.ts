import {
  foldAlphanumeric,
  isEmptySearchQuery,
  matchSearchDocumentQuery,
  normalizeSearchQuery,
  scoreSearchDocument,
  type SearchDocument,
  type SearchField,
  type SearchMatchProfile,
} from '@rpg/search'

import type { SearchableItem, WeightedSearchField } from './search'

/** Maps legacy `@rpg/ui` weighted field roles to `@rpg/search` fields. */
export function mapLegacySearchField(field: WeightedSearchField, key: string): SearchField {
  switch (field.role) {
    case 'label':
      return { key, text: field.text, role: 'primary', weight: field.weight }
    case 'alias':
      return { key, text: field.text, role: 'keyword', weight: field.weight }
    case 'keyword':
      return { key, text: field.text, role: 'primary', weight: 0.35 * field.weight }
    case 'description':
      return { key, text: field.text, role: 'secondary', weight: field.weight }
    case 'group':
      return { key, text: field.text, role: 'secondary', weight: 0.5 * field.weight }
  }
}

export function assembleLegacySearchDocument(
  fields: readonly WeightedSearchField[],
  id = 'item',
): SearchDocument {
  return {
    id,
    fields: fields.map((field, index) => mapLegacySearchField(field, `${field.role}-${index}`)),
  }
}

export function assemblePrimaryTextSearchDocument(text: string, id = 'text'): SearchDocument {
  return {
    id,
    fields: [{ key: 'primary', text, role: 'primary' }],
  }
}

export { foldAlphanumeric }

export function matchesPrimaryTextQuery(
  text: string,
  query: string,
  profile: SearchMatchProfile = 'forgiving',
): boolean {
  if (isEmptySearchQuery(normalizeSearchQuery(query, { profile }))) return true
  return matchSearchDocumentQuery(assemblePrimaryTextSearchDocument(text), query, { profile })
    .matched
}

export function matchesLegacySearchItem(
  item: SearchableItem,
  query: string,
  profile: SearchMatchProfile = 'literal',
): boolean {
  if (isEmptySearchQuery(normalizeSearchQuery(query, { profile }))) return true
  return matchSearchDocumentQuery(assembleLegacySearchDocument(item.fields), query, { profile })
    .matched
}

export function scoreLegacySearchItem(
  item: SearchableItem,
  query: string,
  profile: SearchMatchProfile = 'literal',
): number {
  return scoreSearchDocument(assembleLegacySearchDocument(item.fields), query, { profile })
}

export function rankLegacySearchItems<T extends SearchableItem>(
  items: readonly T[],
  query: string,
  profile: SearchMatchProfile = 'literal',
): T[] {
  if (isEmptySearchQuery(normalizeSearchQuery(query, { profile }))) return [...items]

  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreLegacySearchItem(item, query, profile),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.item)
}
