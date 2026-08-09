import { describe, expect, it } from 'vitest'
import { SETTLEMENT_TYPE_ENTRIES } from '@rpg/contracts'

import { buildSettlementTypeRadioOptions } from './location-settlement-create-setup.lib'

describe('buildSettlementTypeRadioOptions', () => {
  it('maps settlement type entries in canonical entry order', () => {
    expect(buildSettlementTypeRadioOptions().map((option) => option.value)).toEqual(
      Object.keys(SETTLEMENT_TYPE_ENTRIES),
    )
  })

  it('includes labels from entries', () => {
    const city = buildSettlementTypeRadioOptions().find((option) => option.value === 'city')
    expect(city).toEqual({
      value: 'city',
      label: SETTLEMENT_TYPE_ENTRIES.city.label,
      description: SETTLEMENT_TYPE_ENTRIES.city.description,
    })
  })
})
