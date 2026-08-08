import { describe, expect, it } from 'vitest'
import { SETTLEMENT_TYPE_ENTRIES } from '@rpg/contracts'

import { HARBORFORD } from '../fixtures'
import {
  buildSettlementTypeRadioOptions,
  resolveSettlementCreateSetupDescription,
} from './location-settlement-create-setup.lib'

describe('buildSettlementTypeRadioOptions', () => {
  it('maps settlement type entries in canonical entry order', () => {
    expect(buildSettlementTypeRadioOptions().map((option) => option.value)).toEqual(
      Object.keys(SETTLEMENT_TYPE_ENTRIES),
    )
  })

  it('includes labels and descriptions from entries', () => {
    const city = buildSettlementTypeRadioOptions().find((option) => option.value === 'city')
    expect(city).toEqual({
      value: 'city',
      label: SETTLEMENT_TYPE_ENTRIES.city.label,
      description: SETTLEMENT_TYPE_ENTRIES.city.description,
    })
  })
})

describe('resolveSettlementCreateSetupDescription', () => {
  it('mentions parent selection for overview intents', () => {
    expect(resolveSettlementCreateSetupDescription({ authoringType: 'settlement' })).toContain(
      'parent on the next screen',
    )
  })

  it('does not mention parent selection for contained intents', () => {
    expect(
      resolveSettlementCreateSetupDescription({
        authoringType: 'settlement',
        parentLocationId: HARBORFORD.id,
      }),
    ).toBe('Choose the settlement size before authoring.')
  })
})
