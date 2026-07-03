import { describe, expect, it } from 'vitest'
import { defaultMulticlassingRules } from '@rpg/contracts'
import { isFieldOptionGroup } from '@rpg/ui/form'

import {
  getLevelFieldOptions,
  HIT_DIE_SELECT_DIGITS,
  levelSelectDigits,
  withCharacterLevelLabels,
  withLevelOptionLabels,
} from './level-field-options'

const extendedRulesCtx = {
  campaignRules: {
    maxCharacterLevel: 25,
    standardMaxCharacterLevel: 20,
    allowedCharacterCreatureTypes: ['humanoid'] as const,
    multiclassing: defaultMulticlassingRules(),
    extendedProgression: {
      tierName: 'Epic Destiny',
      startsAt: 21,
      maxLevel: 25,
    },
  },
}

describe('level-field-options', () => {
  it('returns numeric labels from getLevelFieldOptions', () => {
    const options = getLevelFieldOptions()
    expect(options[0]).toMatchObject({ value: '1', label: '1' })
    expect(options[9]).toMatchObject({ value: '10', label: '10' })
  })

  it('returns grouped options when extended progression is active', () => {
    const options = getLevelFieldOptions(extendedRulesCtx)

    expect(options).toHaveLength(2)

    const standardGroup = options[0]
    const extendedGroup = options[1]
    expect(standardGroup).toBeDefined()
    expect(extendedGroup).toBeDefined()
    expect(isFieldOptionGroup(standardGroup!)).toBe(true)
    expect(isFieldOptionGroup(extendedGroup!)).toBe(true)

    if (!isFieldOptionGroup(standardGroup!) || !isFieldOptionGroup(extendedGroup!)) {
      throw new Error('expected grouped level options')
    }

    expect(standardGroup.options[0]).toMatchObject({ value: '1', label: '1' })
    expect(standardGroup.options.at(-1)).toMatchObject({ value: '20', label: '20' })
    expect(extendedGroup.options[0]).toMatchObject({ value: '21', label: '21' })
  })

  it('flattens extended tiers when showTierLabels is false', () => {
    const options = getLevelFieldOptions(extendedRulesCtx, { showTierLabels: false })

    expect(options).toHaveLength(25)
    expect(options[0]).toMatchObject({ value: '1', label: '1' })
    expect(options.at(-1)).toMatchObject({ value: '25', label: '25' })
    expect(options.every((option) => !isFieldOptionGroup(option))).toBe(true)
  })

  it('derives digit slots from campaign max level', () => {
    expect(levelSelectDigits()).toBe(2)
    expect(
      levelSelectDigits({
        campaignRules: {
          maxCharacterLevel: 9,
          standardMaxCharacterLevel: 9,
          allowedCharacterCreatureTypes: ['humanoid'],
          multiclassing: defaultMulticlassingRules(),
        },
      }),
    ).toBe(1)
    expect(
      levelSelectDigits({
        campaignRules: {
          maxCharacterLevel: 100,
          standardMaxCharacterLevel: 20,
          allowedCharacterCreatureTypes: ['humanoid'],
          multiclassing: defaultMulticlassingRules(),
        },
      }),
    ).toBe(3)
  })

  it('reserves three digit slots for hit-die labels', () => {
    expect(HIT_DIE_SELECT_DIGITS).toBe(3)
  })

  it('maps level options to Level N labels', () => {
    const options = withCharacterLevelLabels(getLevelFieldOptions())
    expect(options[0]).toMatchObject({ value: '1', label: 'Level 1' })
    expect(options[9]).toMatchObject({ value: '10', label: 'Level 10' })
  })

  it('maps level options with a custom formatter', () => {
    const options = withLevelOptionLabels(getLevelFieldOptions(), (level) => `at level ${level}`)
    expect(options[0]).toMatchObject({ value: '1', label: 'at level 1' })
    expect(options[9]).toMatchObject({ value: '10', label: 'at level 10' })
  })

  it('maps grouped level options to Level N labels', () => {
    const options = withCharacterLevelLabels(getLevelFieldOptions(extendedRulesCtx))
    const standardGroup = options[0]
    expect(isFieldOptionGroup(standardGroup!)).toBe(true)
    if (!isFieldOptionGroup(standardGroup!)) throw new Error('expected grouped level options')
    expect(standardGroup.options[0]).toMatchObject({ value: '1', label: 'Level 1' })
  })
})
