export type SearchFieldRole = 'primary' | 'secondary' | 'keyword'

export type SearchMatchProfile = 'literal' | 'forgiving' | 'alphanumeric'

export type MatchTier = 'exact' | 'prefix' | 'substring' | 'none'

export type MatchKind = 'literal' | 'folded'

export type SearchField = {
  key: string
  text: string
  role?: SearchFieldRole
  /** When set, overrides the role default weight entirely. */
  weight?: number
}

export type SearchDocument = {
  id: string
  fields: readonly SearchField[]
}

export type NormalizedSearchQuery = {
  text: string
  /** Present when a profile applies a secondary normalized form. */
  folded?: string
  profile?: SearchMatchProfile
}

export type SearchMatch = {
  matched: boolean
  tier?: MatchTier
  score?: number
}

export type Comparator<T> = (left: T, right: T) => number
