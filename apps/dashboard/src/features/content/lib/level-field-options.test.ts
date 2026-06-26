import { describe, expect, it } from 'vitest'
import { isFieldOptionGroup } from '@rpg/ui/form'

import {
  getCompactLevelFieldOptions,
  getCompactLevelFieldOptionsGrouped,
  getFlatLevelFieldOptions,
  getLevelFieldOptions,
  HIT_DIE_SELECT_DIGITS,
  levelSelectDigits,
} from './level-field-options'

describe('level-field-options', () => {
  it('uses verbose labels in getLevelFieldOptions by default', () => {
    const options = getLevelFieldOptions()
    expect(options[0]).toMatchObject({ value: '1', label: 'Level 1' })
  })

  it('strips Level prefix in compact options', () => {
    const options = getCompactLevelFieldOptions()
    expect(options[0]).toMatchObject({ value: '1', label: '1' })
    expect(getFlatLevelFieldOptions()[9]).toMatchObject({ value: '10', label: 'Level 10' })
    expect(getCompactLevelFieldOptions()[9]).toMatchObject({ value: '10', label: '10' })
  })

  it('returns grouped compact options when extended progression is active', () => {
    const options = getCompactLevelFieldOptionsGrouped({
      campaignRules: {
        maxCharacterLevel: 25,
        standardMaxCharacterLevel: 20,
        extendedProgression: {
          tierName: 'Epic Destiny',
          startsAt: 21,
          maxLevel: 25,
        },
      },
    })

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

  it('derives digit slots from campaign max level', () => {
    expect(levelSelectDigits()).toBe(2)
    expect(
      levelSelectDigits({ campaignRules: { maxCharacterLevel: 9, standardMaxCharacterLevel: 9 } }),
    ).toBe(1)
    expect(
      levelSelectDigits({
        campaignRules: { maxCharacterLevel: 100, standardMaxCharacterLevel: 20 },
      }),
    ).toBe(3)
  })

  it('reserves three digit slots for hit-die labels', () => {
    expect(HIT_DIE_SELECT_DIGITS).toBe(3)
  })
})
