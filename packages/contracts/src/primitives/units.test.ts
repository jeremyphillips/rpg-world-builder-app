import { describe, expect, it } from 'vitest'
import {
  CURRENCIES,
  currencySchema,
  formatMass,
  formatMoney,
  formatWeight,
  getCurrencyAbbrev,
  getCurrencyLabel,
  getMassUnitAbbrev,
  getMassUnitLabel,
  massSchema,
  massToLb,
  moneySchema,
  moneyToCp,
  MOUNT_CARRYING_CAPACITY_LABEL,
  VEHICLE_CARGO_CAPACITY_LABEL,
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

describe('massSchema', () => {
  it('accepts lb and ton units', () => {
    expect(massSchema.parse({ value: 480, unit: 'lb' })).toEqual({ value: 480, unit: 'lb' })
    expect(massSchema.parse({ value: 150, unit: 'ton' })).toEqual({ value: 150, unit: 'ton' })
  })

  it('rejects negative values and unknown units', () => {
    expect(massSchema.safeParse({ value: -1, unit: 'lb' }).success).toBe(false)
    expect(massSchema.safeParse({ value: 1, unit: 'kg' }).success).toBe(false)
  })
})

describe('massToLb', () => {
  it('converts tons to pounds using the short-ton factor', () => {
    expect(massToLb({ value: 1, unit: 'ton' })).toBe(2000)
    expect(massToLb({ value: 150, unit: 'ton' })).toBe(300_000)
    expect(massToLb({ value: 480, unit: 'lb' })).toBe(480)
  })
})

describe('getMassUnitLabel', () => {
  it('returns display labels for known units', () => {
    expect(getMassUnitLabel('lb')).toBe('Pounds')
    expect(getMassUnitLabel('ton')).toBe('Tons')
  })
})

describe('getMassUnitAbbrev', () => {
  it('returns compact unit labels for forms', () => {
    expect(getMassUnitAbbrev('lb')).toBe('lb.')
    expect(getMassUnitAbbrev('ton')).toBe('ton')
  })
})

describe('formatMass', () => {
  it('delegates lb values to formatWeight', () => {
    expect(formatMass({ value: 480, unit: 'lb' })).toBe('480 lb')
    expect(formatMass({ value: 0.5, unit: 'lb' })).toBe('1/2 lb')
  })

  it('formats ton values with singular/plural labels', () => {
    expect(formatMass({ value: 1, unit: 'ton' })).toBe('1 ton')
    expect(formatMass({ value: 150, unit: 'ton' })).toBe('150 tons')
    expect(formatMass({ value: 1500, unit: 'ton' })).toBe('1,500 tons')
  })
})

describe('capacity field labels', () => {
  it('exports SRD-aligned user-facing labels', () => {
    expect(MOUNT_CARRYING_CAPACITY_LABEL).toBe('Carrying capacity')
    expect(VEHICLE_CARGO_CAPACITY_LABEL).toBe('Cargo')
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

  it('groups large whole-pound weights', () => {
    expect(formatWeight({ value: 1500, unit: 'lb' })).toBe('1,500 lb')
    expect(formatWeight({ value: 1500.5, unit: 'lb' })).toBe('1,500½ lb')
  })
})
