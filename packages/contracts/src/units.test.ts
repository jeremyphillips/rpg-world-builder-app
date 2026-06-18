import { describe, expect, it } from 'vitest'
import {
  CURRENCIES,
  currencySchema,
  formatMoney,
  formatWeight,
  getCurrencyLabel,
  moneySchema,
  moneyToCp,
  weightSchema,
  weightToLb,
} from './units'

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

describe('moneySchema', () => {
  it('parses a well-formed price', () => {
    expect(moneySchema.parse({ amount: 4, currency: 'cp' })).toEqual({ amount: 4, currency: 'cp' })
  })

  it('rejects negative and fractional amounts', () => {
    expect(moneySchema.safeParse({ amount: -1, currency: 'gp' }).success).toBe(false)
    expect(moneySchema.safeParse({ amount: 1.5, currency: 'gp' }).success).toBe(false)
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

describe('weightSchema', () => {
  it('parses fractional pounds', () => {
    expect(weightSchema.parse({ value: 0.5, unit: 'lb' })).toEqual({ value: 0.5, unit: 'lb' })
  })

  it('rejects negative weights and non-lb units', () => {
    expect(weightSchema.safeParse({ value: -1, unit: 'lb' }).success).toBe(false)
    expect(weightSchema.safeParse({ value: 1, unit: 'kg' }).success).toBe(false)
  })
})

describe('weightToLb', () => {
  it('returns the pound value', () => {
    expect(weightToLb({ value: 1.5, unit: 'lb' })).toBe(1.5)
  })
})

describe('formatMoney', () => {
  it('renders whole-number amounts with uppercased currency', () => {
    expect(formatMoney({ amount: 5, currency: 'gp' })).toBe('5 GP')
    expect(formatMoney({ amount: 1, currency: 'cp' })).toBe('1 CP')
    expect(formatMoney({ amount: 10, currency: 'sp' })).toBe('10 SP')
    expect(formatMoney({ amount: 2, currency: 'pp' })).toBe('2 PP')
  })

  it('renders a zero amount', () => {
    expect(formatMoney({ amount: 0, currency: 'gp' })).toBe('0 GP')
  })
})

describe('formatWeight', () => {
  it('renders whole-pound weights', () => {
    expect(formatWeight({ value: 1, unit: 'lb' })).toBe('1 lb')
    expect(formatWeight({ value: 10, unit: 'lb' })).toBe('10 lb')
  })

  it('renders 0.5 as "1/2 lb"', () => {
    expect(formatWeight({ value: 0.5, unit: 'lb' })).toBe('1/2 lb')
  })

  it('renders n.5 as "n½ lb"', () => {
    expect(formatWeight({ value: 1.5, unit: 'lb' })).toBe('1½ lb')
    expect(formatWeight({ value: 2.5, unit: 'lb' })).toBe('2½ lb')
  })
})
