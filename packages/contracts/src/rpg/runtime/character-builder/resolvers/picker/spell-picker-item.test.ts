import { describe, expect, it } from 'vitest'

import type { Spell } from '../../../../content/spell'
import { buildSpellPickerCompactSummary } from '../spellcasting/format-spell-picker-metadata'
import type { SpellPickerItem } from '../spellcasting/resolve-spell-picker-items'
import { compareSpellPickerItemsByRecommendation } from './spell-picker-item'

function makeSpellItem(
  name: string,
  state: Pick<
    SpellPickerItem['state'],
    'isRecommended' | 'canSelect' | 'isAlreadySelected' | 'isSelectionFull'
  >,
): SpellPickerItem {
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const spell = {
    id: `srd-cc-5.2.1:${slug}`,
    slug,
    name,
    level: 0,
    school: 'evocation',
    description: '<p>Test</p>',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    classIds: ['bard'],
    castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true },
  } satisfies Spell
  return {
    spell,
    searchText: name,
    compactSummary: buildSpellPickerCompactSummary(spell),
    state: {
      isAvailable: true,
      disabledReasons: [],
      isAlreadySelected: state.isAlreadySelected,
      isSelectionFull: state.isSelectionFull,
      isRecommended: state.isRecommended,
      canSelect: state.canSelect,
    },
  }
}

describe('compareSpellPickerItemsByRecommendation', () => {
  it('ranks recommended spells above peers', () => {
    const recommended = makeSpellItem('Vicious Mockery', {
      isRecommended: true,
      canSelect: true,
      isAlreadySelected: false,
      isSelectionFull: false,
    })
    const peer = makeSpellItem('Dancing Lights', {
      isRecommended: false,
      canSelect: true,
      isAlreadySelected: false,
      isSelectionFull: false,
    })

    expect(compareSpellPickerItemsByRecommendation(recommended, peer)).toBeLessThan(0)
  })
})
