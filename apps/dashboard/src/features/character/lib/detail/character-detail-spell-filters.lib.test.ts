import { describe, expect, it } from 'vitest'

import { pickSpell } from '@/features/content/lib/fixtures/pick'

import {
  CHARACTER_DETAIL_SPELL_LEVEL_ALL,
  filterCharacterDetailSpellCards,
  formatCharacterDetailSpellLevelChipLabel,
  resolveCharacterDetailSpellLevelChipOptions,
} from './character-detail-spell-filters.lib'
import type { CharacterSheetSpellCard } from './character-sheet-catalog'

function resolvedSpellCard(
  spell: ReturnType<typeof pickSpell>,
  id = spell.id,
): CharacterSheetSpellCard {
  return {
    id,
    displayName: spell.name,
    referenceId: spell.id,
    prepared: true,
    sources: [{ label: 'Class' }],
    status: 'resolved',
    spell,
    entry: {
      spellId: spell.id,
      sources: [
        { kind: 'classSpellcasting', sourceId: 'srd-cc-5.2.1:wizard', grantId: 'cantrips' },
      ],
      access: { classKnown: true },
      selection: { prepared: true },
    },
  }
}

describe('character-detail-spell-filters.lib', () => {
  const cantrip = resolvedSpellCard(pickSpell('fire-bolt'), 'cantrip-1')
  const firstLevel = resolvedSpellCard(pickSpell('magic-missile'), 'spell-1')

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
    expect(
      filterCharacterDetailSpellCards([cantrip, firstLevel], {
        selectedLevel: '0',
        searchQuery: '',
      }),
    ).toEqual([cantrip])
  })
})
