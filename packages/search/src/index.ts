export type {
  Comparator,
  MatchTier,
  NormalizedSearchQuery,
  SearchDocument,
  SearchField,
  SearchFieldRole,
  SearchMatch,
} from './types'

export { getSearchQueryText, isEmptySearchQuery, normalizeSearchQuery } from './normalize'

export { classifyMatchTier, scoreFieldMatch, scoreSearchFields } from './score'

export { matchSearchDocument, matchSearchDocumentQuery, scoreSearchDocument } from './match'
