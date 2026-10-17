import { describe, expect, it } from 'vitest'

import { damageDefenseComboboxOptions } from './monster-damage-defense-form.lib'

describe('damageDefenseComboboxOptions', () => {
  const options = [
    { value: 'fire', label: 'Fire' },
    { value: 'cold', label: 'Cold' },
  ]

  it('marks cross-list damage types disabled with a reason', () => {
    expect(
      damageDefenseComboboxOptions(
        'resistances',
        {
          vulnerabilities: ['fire'],
          resistances: [],
          immunities: [],
          conditionImmunities: [],
        },
        options,
      ),
    ).toEqual([
      {
        value: 'fire',
        label: 'Fire',
        disabled: true,
        disabledReason: 'Already in Vulnerabilities',
      },
      { value: 'cold', label: 'Cold', disabled: false },
    ])
  })
})
