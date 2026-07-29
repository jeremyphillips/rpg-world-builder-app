export type SearchFieldRole = 'primary' | 'secondary' | 'keyword'

export type MatchTier = 'exact' | 'prefix' | 'substring' | 'none'

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
}

export type SearchMatch = {
  matched: boolean
  tier?: MatchTier
  score?: number
}

export type Comparator<T> = (left: T, right: T) => number
