import {
  countModifiedFilters,
  createChipsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import type { CharacterSheetSpellCard } from './character-sheet-catalog'
import {
  CHARACTER_DETAIL_SPELL_LEVEL_ALL,
  CHARACTER_DETAIL_SPELL_LEVEL_LABEL,
  resolveCharacterDetailSpellLevelChipOptions,
  type CharacterDetailSpellLevelFilter,
} from './character-detail-spell-filters.lib'

export type CharacterDetailSpellFilterState = {
  selectedLevel?: CharacterDetailSpellLevelFilter
}

export const CHARACTER_DETAIL_SPELL_FILTER_LAYOUT = {
  primaryFieldIds: ['selectedLevel'],
} as const satisfies FilterCatalogLayoutConfig<CharacterDetailSpellFilterState>

export type CreateCharacterDetailSpellFilterSchemaArgs = {
  cards: readonly CharacterSheetSpellCard[]
  showLevelFilter: boolean
}

export function createCharacterDetailSpellFilterSchema(
  args: CreateCharacterDetailSpellFilterSchemaArgs,
): FilterSchema<CharacterSheetSpellCard, CharacterDetailSpellFilterState> {
  const fields = []

  if (args.showLevelFilter) {
    const levelOptions = resolveCharacterDetailSpellLevelChipOptions(args.cards)

    fields.push(
      createChipsFilter<CharacterSheetSpellCard, CharacterDetailSpellFilterState, 'selectedLevel'>({
        id: 'selectedLevel',
        label: CHARACTER_DETAIL_SPELL_LEVEL_LABEL,
        selectionMode: 'single-required',
        defaultValue: CHARACTER_DETAIL_SPELL_LEVEL_ALL,
        isValueConstraining: (value) => value !== CHARACTER_DETAIL_SPELL_LEVEL_ALL,
        options: [...levelOptions],
        matches: (card, value) => {
          if (value === CHARACTER_DETAIL_SPELL_LEVEL_ALL) return true
          if (card.status !== 'resolved') return false
          return String(card.spell.level) === value
        },
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => {
      if (!args.showLevelFilter) {
        return { selectedLevel: CHARACTER_DETAIL_SPELL_LEVEL_ALL }
      }

      const levelOptions = resolveCharacterDetailSpellLevelChipOptions(args.cards)
      const allowedValues = new Set(levelOptions.map((option) => option.value))

      return {
        selectedLevel:
          state.selectedLevel && allowedValues.has(state.selectedLevel)
            ? state.selectedLevel
            : CHARACTER_DETAIL_SPELL_LEVEL_ALL,
      }
    },
  })
}

export function countCharacterDetailSpellStructuredFilters(
  schema: FilterSchema<CharacterSheetSpellCard, CharacterDetailSpellFilterState>,
  state: CharacterDetailSpellFilterState,
): number {
  return countModifiedFilters(schema, state)
}
