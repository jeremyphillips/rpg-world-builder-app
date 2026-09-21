import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from './choice-set'
import { formatChoicePoolDescription } from './format-choice-step-copy'

const spellChoiceSet = {
  id: 'spellcasting:fixture-wizard:spellbook',
  sourceType: 'spellcasting',
  sourceId: 'fixture-wizard',
  choiceType: 'spell',
  label: 'Spellbook Spells',
  min: 6,
  max: 6,
  required: true,
  options: Array.from({ length: 12 }, (_, index) => ({
    id: `spell-${index}`,
    label: `Spell ${index}`,
  })),
} as const satisfies ChoiceSet

describe('formatChoicePoolDescription', () => {
  it('uses level-filtered pool copy for spells', () => {
    expect(
      formatChoicePoolDescription({
        choiceSet: spellChoiceSet,
        spellLevel: 3,
        filteredOptionCount: 12,
      }),
    ).toBe('Choose from 12 available 3rd-level spells.')
  })

  it('uses cantrip pool copy', () => {
    const cantripChoiceSet: ChoiceSet = {
      ...spellChoiceSet,
      choiceType: 'cantrip',
      label: 'Cantrips',
    }

    expect(
      formatChoicePoolDescription({
        choiceSet: cantripChoiceSet,
        filteredOptionCount: 16,
      }),
    ).toBe('Choose from 16 available cantrips.')
  })
})
