import type { NormalizedSearchQuery, SearchMatchProfile } from './types'

/** Minimum folded query length before separator-insensitive matching applies. */
export const MIN_FOLDED_QUERY_LENGTH = 3

/** Strips whitespace and common separators for forgiving matching. */
export function foldSeparators(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\-_./]+/g, '')
}

/** Lowercases and strips non-alphanumeric characters (dev-bench ticket titles). */
export function foldAlphanumeric(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** Normalizes free-text queries for case-insensitive matching. */
export function normalizeSearchQuery(
  query: string,
  options: { profile?: SearchMatchProfile } = {},
): NormalizedSearchQuery {
  const profile = options.profile ?? 'literal'
  const text = query.trim().toLowerCase()
  const result: NormalizedSearchQuery = { text, profile }

  if (profile === 'forgiving') {
    const folded = foldSeparators(text)
    if (folded.length >= MIN_FOLDED_QUERY_LENGTH) {
      result.folded = folded
    }
    return result
  }

  if (profile === 'alphanumeric') {
    const folded = foldAlphanumeric(query)
    if (folded.length > 0) {
      result.folded = folded
    }
    return result
  }

  return result
}

/** Returns true when the normalized query has no searchable text. */
export function isEmptySearchQuery(query: NormalizedSearchQuery): boolean {
  if (query.profile === 'alphanumeric') {
    return !query.folded
  }

  return query.text.length === 0
}

/** Convenience accessor for the normalized query string. */
export function getSearchQueryText(query: NormalizedSearchQuery): string {
  return query.text
}
