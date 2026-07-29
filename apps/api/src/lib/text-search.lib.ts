import { matchSearchDocumentQuery, type SearchMatchProfile } from '@rpg/search'

function assembleTextSearchDocument(text: string, id: string) {
  return {
    id,
    fields: [{ key: 'primary', text, role: 'primary' as const }],
  }
}

/** Matches in-memory list rows against a forgiving text query. */
export function matchesTextSearchQuery(
  text: string,
  query: string | undefined,
  profile: SearchMatchProfile = 'forgiving',
): boolean {
  if (!query?.trim()) return true
  return matchSearchDocumentQuery(assembleTextSearchDocument(text, 'text'), query, { profile })
    .matched
}

/** Returns true when any field matches the query. */
export function matchesAnyTextSearchQuery(
  fields: readonly string[],
  query: string | undefined,
  profile: SearchMatchProfile = 'forgiving',
): boolean {
  if (!query?.trim()) return true
  return fields.some(
    (text, index) =>
      matchSearchDocumentQuery(assembleTextSearchDocument(text, `field-${index}`), query, {
        profile,
      }).matched,
  )
}
