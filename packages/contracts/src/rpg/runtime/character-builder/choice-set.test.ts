import { describe, expect, it } from 'vitest'

import {
  CHOICE_SOURCE_TYPES,
  CHOICE_TYPES,
  areRequiredChoiceSetsSatisfied,
  buildChoiceSetId,
  isChoiceSetSatisfied,
} from './choice-set'
import type { ChoiceSet } from './choice-set'

function makeChoiceSet(overrides: Partial<ChoiceSet> = {}): ChoiceSet {
  return {
    id: 'class:srd-cc-5.2.1:fighter:skills',
    sourceType: 'class',
    sourceId: 'srd-cc-5.2.1:fighter',
    choiceType: 'skillProficiency',
    label: 'Choose Skills',
    min: 2,
    max: 2,
    options: [
      { id: 'srd-cc-5.2.1:athletics', label: 'Athletics' },
      { id: 'srd-cc-5.2.1:perception', label: 'Perception' },
      { id: 'srd-cc-5.2.1:intimidation', label: 'Intimidation' },
    ],
    required: true,
    ...overrides,
  }
}

describe('CHOICE_SOURCE_TYPES', () => {
  it('contains the expected source types', () => {
    expect(CHOICE_SOURCE_TYPES).toContain('species')
    expect(CHOICE_SOURCE_TYPES).toContain('heritage')
    expect(CHOICE_SOURCE_TYPES).toContain('class')
    expect(CHOICE_SOURCE_TYPES).toContain('spellcasting')
  })
})

describe('CHOICE_TYPES', () => {
  it('contains the expected choice types', () => {
    const expected = [
      'skillProficiency',
      'weaponProficiency',
      'toolProficiency',
      'armorTraining',
      'language',
      'trait',
      'equipment',
      'cantrip',
      'spell',
    ]
    for (const type of expected) {
      expect(CHOICE_TYPES).toContain(type)
    }
  })
})

describe('buildChoiceSetId', () => {
  it('produces a colon-separated deterministic id', () => {
    expect(buildChoiceSetId('class', 'srd-cc-5.2.1:wizard', 'skills')).toBe(
      'class:srd-cc-5.2.1:wizard:skills',
    )
  })

  it('constructs known example ids from the spec', () => {
    expect(buildChoiceSetId('species', 'srd-cc-5.2.1:elf', 'heritage')).toBe(
      'species:srd-cc-5.2.1:elf:heritage',
    )
    expect(buildChoiceSetId('class', 'srd-cc-5.2.1:fighter', 'starting-equipment')).toBe(
      'class:srd-cc-5.2.1:fighter:starting-equipment',
    )
    expect(buildChoiceSetId('spellcasting', 'srd-cc-5.2.1:wizard', 'cantrips')).toBe(
      'spellcasting:srd-cc-5.2.1:wizard:cantrips',
    )
    expect(buildChoiceSetId('spellcasting', 'srd-cc-5.2.1:wizard', 'spells')).toBe(
      'spellcasting:srd-cc-5.2.1:wizard:spells',
    )
  })
})

describe('isChoiceSetSatisfied', () => {
  const cs = makeChoiceSet({ min: 2, max: 2 })

  it('returns false when selections are below min', () => {
    expect(isChoiceSetSatisfied(cs, [])).toBe(false)
    expect(isChoiceSetSatisfied(cs, ['srd-cc-5.2.1:athletics'])).toBe(false)
  })

  it('returns true when selections meet min', () => {
    expect(isChoiceSetSatisfied(cs, ['srd-cc-5.2.1:athletics', 'srd-cc-5.2.1:perception'])).toBe(
      true,
    )
  })

  it('returns true when selections exceed min (over-selection is a resolver concern)', () => {
    expect(
      isChoiceSetSatisfied(cs, [
        'srd-cc-5.2.1:athletics',
        'srd-cc-5.2.1:perception',
        'srd-cc-5.2.1:intimidation',
      ]),
    ).toBe(true)
  })

  it('returns true for a min:0 optional choice set with no selections', () => {
    const optional = makeChoiceSet({ min: 0, required: false })
    expect(isChoiceSetSatisfied(optional, [])).toBe(true)
  })
})

describe('areRequiredChoiceSetsSatisfied', () => {
  it('returns true when all required sets are satisfied', () => {
    const choiceSets = [
      makeChoiceSet({
        id: 'class:srd-cc-5.2.1:fighter:skills',
        min: 2,
        required: true,
      }),
    ]
    const selections = {
      'class:srd-cc-5.2.1:fighter:skills': ['srd-cc-5.2.1:athletics', 'srd-cc-5.2.1:perception'],
    }
    expect(areRequiredChoiceSetsSatisfied(choiceSets, selections)).toBe(true)
  })

  it('returns false when a required set is unsatisfied', () => {
    const choiceSets = [makeChoiceSet({ id: 'class:srd-cc-5.2.1:fighter:skills', required: true })]
    expect(areRequiredChoiceSetsSatisfied(choiceSets, {})).toBe(false)
  })

  it('returns true when the only unsatisfied set is not required', () => {
    const choiceSets = [makeChoiceSet({ id: 'class:srd-cc-5.2.1:fighter:skills', required: false })]
    expect(areRequiredChoiceSetsSatisfied(choiceSets, {})).toBe(true)
  })

  it('returns true for an empty choice-set list', () => {
    expect(areRequiredChoiceSetsSatisfied([], {})).toBe(true)
  })

  it('handles multiple choice sets — all must be satisfied', () => {
    const choiceSets = [
      makeChoiceSet({ id: 'class:srd-cc-5.2.1:fighter:skills', min: 2, required: true }),
      makeChoiceSet({
        id: 'class:srd-cc-5.2.1:fighter:starting-equipment',
        choiceType: 'equipment',
        min: 1,
        required: true,
      }),
    ]
    const partialSelections = {
      'class:srd-cc-5.2.1:fighter:skills': ['srd-cc-5.2.1:athletics', 'srd-cc-5.2.1:perception'],
    }
    expect(areRequiredChoiceSetsSatisfied(choiceSets, partialSelections)).toBe(false)

    const fullSelections = {
      ...partialSelections,
      'class:srd-cc-5.2.1:fighter:starting-equipment': ['pack-a'],
    }
    expect(areRequiredChoiceSetsSatisfied(choiceSets, fullSelections)).toBe(true)
  })
})
