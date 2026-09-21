import { describe, expect, it } from 'vitest'

import type { ChoiceSet } from './choice-set'
import {
  isChoiceSetBuilderComplete,
  resolveChoiceSetAvailability,
} from './resolve-choice-set-availability'

const spellChoiceSet = {
  id: 'class:srd-cc-5.2.1:druid:spells',
  sourceType: 'class',
  sourceId: 'srd-cc-5.2.1:druid',
  choiceType: 'spell',
  label: 'Circle Spells',
  min: 2,
  max: 2,
  required: true,
  options: [{ id: 'moonbeam', label: 'Moonbeam' }],
} as const satisfies ChoiceSet

describe('resolveChoiceSetAvailability', () => {
  it('keeps authored max while relaxing completion for limited pools', () => {
    const resolved = resolveChoiceSetAvailability(spellChoiceSet)

    expect(resolved).toEqual({
      availability: 'limited',
      availableCount: 1,
      authoredRequiredCount: 2,
      effectiveRequiredCount: 1,
    })
  })

  it('completes limited pools when all available options are chosen', () => {
    expect(isChoiceSetBuilderComplete(spellChoiceSet, ['moonbeam'])).toBe(true)
  })

  it('does not block completion when no options exist', () => {
    const emptyChoiceSet: ChoiceSet = {
      ...spellChoiceSet,
      options: [],
    }

    expect(resolveChoiceSetAvailability(emptyChoiceSet).availability).toBe('none')
    expect(isChoiceSetBuilderComplete(emptyChoiceSet, [])).toBe(true)
  })

  it('does not require fill when requiredToComplete is false', () => {
    const optionalChoiceSet: ChoiceSet = {
      ...spellChoiceSet,
      options: Array.from({ length: 8 }, (_, index) => ({
        id: `spell-${index}`,
        label: `Spell ${index}`,
      })),
      requiredToComplete: false,
    }

    expect(isChoiceSetBuilderComplete(optionalChoiceSet, [])).toBe(true)
  })
})
