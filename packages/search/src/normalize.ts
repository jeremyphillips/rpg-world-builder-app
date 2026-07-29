import type { NormalizedSearchQuery } from './types'

/** Normalizes free-text queries for case-insensitive matching. */
export function normalizeSearchQuery(query: string): NormalizedSearchQuery {
  return { text: query.trim().toLowerCase() }
}

/** Returns true when the normalized query has no searchable text. */
export function isEmptySearchQuery(query: NormalizedSearchQuery): boolean {
  return query.text.length === 0
}

/** Convenience accessor for the normalized query string. */
export function getSearchQueryText(query: NormalizedSearchQuery): string {
  return query.text
}
