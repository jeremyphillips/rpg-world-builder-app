import { describe, expect, it } from 'vitest'

import {
  costFromForm,
  costToForm,
  equipmentEconomyFormDefaults,
  hasMarketPriceDefaultForKind,
} from './equipment-economy-form-values'

describe('hasMarketPriceDefaultForKind', () => {
  it('defaults to false for magic items and true for other kinds', () => {
    expect(hasMarketPriceDefaultForKind('magic_item')).toBe(false)
    expect(hasMarketPriceDefaultForKind('weapon')).toBe(true)
  })
})

describe('equipmentEconomyFormDefaults', () => {
  it('omits amount for priced kinds and nulls cost for magic items', () => {
    expect(equipmentEconomyFormDefaults('weapon')).toEqual({
      hasMarketPrice: true,
      cost: { currency: 'gp' },
    })
    expect(equipmentEconomyFormDefaults('magic_item')).toEqual({
      hasMarketPrice: false,
      cost: null,
    })
  })
})

describe('costFromForm', () => {
  it('returns null when market price is disabled', () => {
    expect(costFromForm(false, { amount: 5, currency: 'gp' })).toBeNull()
  })

  it('returns positive money when market price is enabled', () => {
    expect(costFromForm(true, { amount: 5, currency: 'gp' })).toEqual({
      amount: 5,
      currency: 'gp',
    })
  })
})

describe('costToForm', () => {
  it('hydrates switch and cost fields from stored equipment cost', () => {
    expect(costToForm(null)).toEqual({ hasMarketPrice: false, cost: null })
    expect(costToForm({ amount: 2, currency: 'gp' })).toEqual({
      hasMarketPrice: true,
      cost: { amount: 2, currency: 'gp' },
    })
  })
})
