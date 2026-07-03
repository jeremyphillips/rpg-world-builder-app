import { describe, expect, it } from 'vitest'
import { isFieldOptionGroup } from '@rpg/ui/form'

import { getSpellcastingAbilityFieldOptions } from './spellcasting-ability-field-options'

describe('getSpellcastingAbilityFieldOptions', () => {
  it('returns Common and Advanced ability groups', () => {
    const options = getSpellcastingAbilityFieldOptions()

    expect(options).toHaveLength(2)

    const commonGroup = options[0]
    const advancedGroup = options[1]
    expect(isFieldOptionGroup(commonGroup!)).toBe(true)
    expect(isFieldOptionGroup(advancedGroup!)).toBe(true)
    if (!isFieldOptionGroup(commonGroup!) || !isFieldOptionGroup(advancedGroup!)) {
      throw new Error('expected grouped spellcasting ability options')
    }

    expect(commonGroup.label).toBe('Common')
    expect(commonGroup.options.map((option) => option.label)).toEqual([
      'Intelligence',
      'Wisdom',
      'Charisma',
    ])

    expect(advancedGroup.label).toBe('Advanced')
    expect(advancedGroup.options.map((option) => option.label)).toEqual([
      'Strength',
      'Dexterity',
      'Constitution',
    ])
  })
})
