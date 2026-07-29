import { isEmptySearchQuery, normalizeSearchQuery } from './normalize'
import { scoreSearchFields } from './score'
import type {
  NormalizedSearchQuery,
  SearchDocument,
  SearchMatch,
  SearchMatchProfile,
} from './types'

/** Matches a document against a normalized query. Empty queries return a neutral successful match. */
export function matchSearchDocument(
  document: SearchDocument,
  query: NormalizedSearchQuery,
): SearchMatch {
  if (isEmptySearchQuery(query)) {
    return { matched: true }
  }

  const { score, tier } = scoreSearchFields(document.fields, query)
  if (score <= 0) {
    return { matched: false, tier: 'none', score: 0 }
  }

  return { matched: true, tier, score }
}

export type SearchMatchQueryOptions = {
  profile?: SearchMatchProfile
}

/** Matches a document against a raw query string. */
export function matchSearchDocumentQuery(
  document: SearchDocument,
  query: string,
  options: SearchMatchQueryOptions = {},
): SearchMatch {
  return matchSearchDocument(document, normalizeSearchQuery(query, options))
}

/** Returns the numeric relevance score for a raw query string. */
export function scoreSearchDocument(
  document: SearchDocument,
  query: string,
  options: SearchMatchQueryOptions = {},
): number {
  return matchSearchDocumentQuery(document, query, options).score ?? 0
}
