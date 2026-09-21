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
  it('uses generic pool copy for spells without level wording', () => {
    expect(
      formatChoicePoolDescription({
        choiceSet: spellChoiceSet,
        spellLevel: 3,
      }),
    ).toBe('Choose from 12 available spells.')
  })

  it('uses cantrip pool copy', () => {
    const cantripChoiceSet: ChoiceSet = {
      ...spellChoiceSet,
      choiceType: 'cantrip',
      label: 'Cantrips',
    }

    expect(
      formatChoicePoolDescription({
        choiceSet: {
          ...cantripChoiceSet,
          options: Array.from({ length: 16 }, (_, index) => ({
            id: `cantrip-${index}`,
            label: `Cantrip ${index}`,
          })),
        },
      }),
    ).toBe('Choose from 16 available cantrips.')
  })

  it('enumerates up to five filtered spell options then falls back to a count', () => {
    const filteredOptions = Array.from({ length: 6 }, (_, index) => ({
      id: `spell-${index}`,
      label: `Spell ${index}`,
    }))

    expect(
      formatChoicePoolDescription({
        choiceSet: { ...spellChoiceSet, options: filteredOptions },
        spellLevel: 1,
      }),
    ).toBe('Choose from 6 available spells.')

    expect(
      formatChoicePoolDescription({
        choiceSet: {
          ...spellChoiceSet,
          options: filteredOptions.slice(0, 3),
        },
        spellLevel: 1,
      }),
    ).toBe('Choose from Spell 0, Spell 1, and Spell 2.')
  })
})
