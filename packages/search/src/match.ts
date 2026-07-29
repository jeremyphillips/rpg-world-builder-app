import { normalizeSearchQuery } from './normalize'
import { scoreSearchFields } from './score'
import type { NormalizedSearchQuery, SearchDocument, SearchMatch } from './types'

/** Matches a document against a normalized query. Empty queries return a neutral successful match. */
export function matchSearchDocument(
  document: SearchDocument,
  query: NormalizedSearchQuery,
): SearchMatch {
  if (query.text.length === 0) {
    return { matched: true }
  }

  const { score, tier } = scoreSearchFields(document.fields, query.text)
  if (score <= 0) {
    return { matched: false, tier: 'none', score: 0 }
  }

  return { matched: true, tier, score }
}

/** Matches a document against a raw query string. */
export function matchSearchDocumentQuery(document: SearchDocument, query: string): SearchMatch {
  return matchSearchDocument(document, normalizeSearchQuery(query))
}

/** Returns the numeric relevance score for a raw query string. */
export function scoreSearchDocument(document: SearchDocument, query: string): number {
  return matchSearchDocumentQuery(document, query).score ?? 0
}
