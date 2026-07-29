export type {
  Comparator,
  MatchKind,
  MatchTier,
  NormalizedSearchQuery,
  SearchDocument,
  SearchField,
  SearchFieldRole,
  SearchMatch,
  SearchMatchProfile,
} from './types'

export {
  foldAlphanumeric,
  foldSeparators,
  getSearchQueryText,
  isEmptySearchQuery,
  MIN_FOLDED_QUERY_LENGTH,
  normalizeSearchQuery,
} from './normalize'

export { classifyMatchTier, scoreFieldMatch, scoreSearchFields } from './score'

export {
  matchSearchDocument,
  matchSearchDocumentQuery,
  scoreSearchDocument,
  type SearchMatchQueryOptions,
} from './match'
