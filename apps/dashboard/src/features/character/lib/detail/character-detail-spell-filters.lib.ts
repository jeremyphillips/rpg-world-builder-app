import { normalizeSearchQuery } from '@rpg/ui'
import { applyFilterSchema, type FilterSchema } from '@rpg/ui/filters'

import {
  CHARACTER_DETAIL_CATALOG_SEARCH_MIN_ITEMS,
  matchesCharacterDetailCatalogSearchQuery,
} from './character-detail-catalog-filters.lib'
import type { CharacterDetailSpellFilterState } from './character-detail-spell-filter-schema'
import type { CharacterSheetSpellCard } from './character-sheet-catalog'

export const CHARACTER_DETAIL_SPELL_LEVEL_ALL = '__all__' as const

export const CHARACTER_DETAIL_SPELL_LEVEL_LABEL = 'Level'
export const CHARACTER_DETAIL_SPELL_RESET_VIEW_LABEL = 'Reset view'
export const CHARACTER_DETAIL_SPELL_SEARCH_PLACEHOLDER = 'Search spells'

export type CharacterDetailSpellLevelFilter = typeof CHARACTER_DETAIL_SPELL_LEVEL_ALL | string

export const CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS = {
  selectedLevel: CHARACTER_DETAIL_SPELL_LEVEL_ALL,
  searchQuery: '',
} as const

export const CHARACTER_DETAIL_SPELL_SEARCH_MIN_ITEMS = CHARACTER_DETAIL_CATALOG_SEARCH_MIN_ITEMS

const MAX_SPELL_LEVEL = 9

export function formatCharacterDetailSpellLevelChipLabel(level: number): string {
  return String(level)
}

export function resolveCharacterDetailSpellLevelChipOptions(
  cards: readonly CharacterSheetSpellCard[],
): readonly { value: string; label: string }[] {
  const levels = new Set<number>()

  for (const card of cards) {
    if (card.status !== 'resolved') continue
    if (card.spell.level < 0 || card.spell.level > MAX_SPELL_LEVEL) continue
    levels.add(card.spell.level)
  }

  const sortedLevels = [...levels].sort((left, right) => left - right)

  return [
    { value: CHARACTER_DETAIL_SPELL_LEVEL_ALL, label: 'All' },
    ...sortedLevels.map((level) => ({
      value: String(level),
      label: formatCharacterDetailSpellLevelChipLabel(level),
    })),
  ]
}

export function filterCharacterDetailSpellCards(
  cards: readonly CharacterSheetSpellCard[],
  options: {
    schema: FilterSchema<CharacterSheetSpellCard, CharacterDetailSpellFilterState>
    filterState: CharacterDetailSpellFilterState
    searchQuery: string
  },
): CharacterSheetSpellCard[] {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery)
  const searchFiltered = cards.filter((card) =>
    matchesCharacterDetailCatalogSearchQuery(card, normalizedQuery),
  )

  return applyFilterSchema(options.schema, options.filterState, searchFiltered)
}
