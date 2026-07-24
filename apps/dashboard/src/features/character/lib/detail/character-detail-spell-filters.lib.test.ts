import { describe, expect, it } from 'vitest'

import { pickSpell } from '@/features/content/lib/fixtures/pick'

import { createCharacterDetailSpellFilterSchema } from './character-detail-spell-filter-schema'
import {
  CHARACTER_DETAIL_SPELL_LEVEL_ALL,
  filterCharacterDetailSpellCards,
  formatCharacterDetailSpellLevelChipLabel,
  resolveCharacterDetailSpellLevelChipOptions,
} from './character-detail-spell-filters.lib'
import { resolvedSpellSheetCardFixture } from './character-sheet-catalog.fixtures'

describe('character-detail-spell-filters.lib', () => {
  const cantrip = resolvedSpellSheetCardFixture(pickSpell('fire-bolt'), 'cantrip-1')
  const firstLevel = resolvedSpellSheetCardFixture(pickSpell('magic-missile'), 'spell-1')

  it('formats level chip labels as plain numbers', () => {
    expect(formatCharacterDetailSpellLevelChipLabel(0)).toBe('0')
    expect(formatCharacterDetailSpellLevelChipLabel(3)).toBe('3')
  })

  it('builds level chips only for levels present on resolved cards', () => {
    expect(resolveCharacterDetailSpellLevelChipOptions([cantrip, firstLevel])).toEqual([
      { value: CHARACTER_DETAIL_SPELL_LEVEL_ALL, label: 'All' },
      { value: '0', label: '0' },
      { value: '1', label: '1' },
    ])
  })

  it('filters cards to a single selected level', () => {
    const schema = createCharacterDetailSpellFilterSchema({
      cards: [cantrip, firstLevel],
      showLevelFilter: true,
    })

    expect(
      filterCharacterDetailSpellCards([cantrip, firstLevel], {
        schema,
        filterState: { selectedLevel: '0' },
        searchQuery: '',
      }),
    ).toEqual([cantrip])
  })
})
