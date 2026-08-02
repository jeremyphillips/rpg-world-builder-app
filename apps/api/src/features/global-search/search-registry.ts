import type { SearchSource } from './lib/search-source.types'
import { charactersSearchSource } from './sources/characters.source'
import { contentSearchSource } from './sources/content.source'
import { gameTermsSearchSource } from './sources/game-terms.source'

export const SEARCH_SOURCES: readonly SearchSource[] = [
  contentSearchSource,
  gameTermsSearchSource,
  charactersSearchSource,
]
