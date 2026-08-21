import { describe, expect, it } from 'vitest'

import {
  CURRENCIES,
  currencySchema,
  equipmentCostSchema,
  formatMoney,
  getCurrencyAbbrev,
  getCurrencyLabel,
  moneySchema,
  moneyToCp,
  positiveMoneySchema,
} from './money'

describe('currencySchema', () => {
  it('accepts every standard coin denomination', () => {
    for (const id of Object.keys(CURRENCIES)) {
      expect(currencySchema.parse(id)).toBe(id)
    }
  })

  it('rejects electrum (dropped from the 2024 ruleset)', () => {
    expect(currencySchema.safeParse('ep').success).toBe(false)
  })

  it('rejects unknown currencies', () => {
    expect(currencySchema.safeParse('gil').success).toBe(false)
  })
})

describe('getCurrencyLabel', () => {
  it('returns the display label for a known currency', () => {
    expect(getCurrencyLabel('gp')).toBe('Gold')
  })

  it('falls back to the raw id for unknown currencies', () => {
    expect(getCurrencyLabel('gil')).toBe('gil')
  })
})

describe('getCurrencyAbbrev', () => {
  it('returns uppercase coin ids', () => {
    expect(getCurrencyAbbrev('gp')).toBe('GP')
    expect(getCurrencyAbbrev('cp')).toBe('CP')
    expect(getCurrencyAbbrev('sp')).toBe('SP')
    expect(getCurrencyAbbrev('pp')).toBe('PP')
  })
})

describe('moneySchema', () => {
  it('parses a well-formed price', () => {
    expect(moneySchema.parse({ amount: 4, currency: 'cp' })).toEqual({ amount: 4, currency: 'cp' })
  })

  it('rejects negative and fractional amounts', () => {
    expect(moneySchema.safeParse({ amount: -1, currency: 'gp' }).success).toBe(false)
    expect(moneySchema.safeParse({ amount: 1.5, currency: 'gp' }).success).toBe(false)
  })
})

describe('positiveMoneySchema', () => {
  it('parses positive integer amounts', () => {
    expect(positiveMoneySchema.parse({ amount: 1, currency: 'gp' })).toEqual({
      amount: 1,
      currency: 'gp',
    })
  })

  it('rejects zero amounts', () => {
    expect(positiveMoneySchema.safeParse({ amount: 0, currency: 'gp' }).success).toBe(false)
  })
})

describe('equipmentCostSchema', () => {
  it('accepts null and positive money', () => {
    expect(equipmentCostSchema.parse(null)).toBeNull()
    expect(equipmentCostSchema.parse({ amount: 5, currency: 'sp' })).toEqual({
      amount: 5,
      currency: 'sp',
    })
  })

  it('rejects zero-cost prices', () => {
    expect(equipmentCostSchema.safeParse({ amount: 0, currency: 'gp' }).success).toBe(false)
  })
})

describe('moneyToCp', () => {
  it('converts each denomination to copper using the map rate', () => {
    expect(moneyToCp({ amount: 1, currency: 'cp' })).toBe(1)
    expect(moneyToCp({ amount: 1, currency: 'sp' })).toBe(10)
    expect(moneyToCp({ amount: 2, currency: 'gp' })).toBe(200)
    expect(moneyToCp({ amount: 3, currency: 'pp' })).toBe(3000)
  })
})

describe('formatMoney', () => {
  it('renders whole-number amounts with uppercased currency', () => {
    expect(formatMoney({ amount: 5, currency: 'gp' })).toBe('5 GP')
    expect(formatMoney({ amount: 1, currency: 'cp' })).toBe('1 CP')
    expect(formatMoney({ amount: 10, currency: 'sp' })).toBe('10 SP')
    expect(formatMoney({ amount: 2, currency: 'pp' })).toBe('2 PP')
  })

  it('groups large amounts', () => {
    expect(formatMoney({ amount: 3000, currency: 'gp' })).toBe('3,000 GP')
  })

  it('renders a zero amount', () => {
    expect(formatMoney({ amount: 0, currency: 'gp' })).toBe('0 GP')
  })
})
