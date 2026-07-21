import { describe, expect, it } from 'vitest'
import {
  CURRENCIES,
  currencySchema,
  distanceSchema,
  positiveDistanceSchema,
  formatMass,
  formatMoney,
  formatSpeedRate,
  formatWeight,
  getCurrencyAbbrev,
  getCurrencyLabel,
  getMassUnitAbbrev,
  getMassUnitLabel,
  getSpeedRateUnitAbbrev,
  massSchema,
  massToLb,
  moneySchema,
  moneyToCp,
  positiveMoneySchema,
  equipmentCostSchema,
  MOUNT_CARRYING_CAPACITY_LABEL,
  parseSpeedRateString,
  speedRateSchema,
  VEHICLE_CARGO_CAPACITY_LABEL,
  weightSchema,
  weightToLb,
} from './units'

describe('distanceSchema', () => {
  it('accepts zero and fractional feet', () => {
    expect(distanceSchema.parse({ value: 0, unit: 'ft' })).toEqual({ value: 0, unit: 'ft' })
    expect(distanceSchema.parse({ value: 0.5, unit: 'ft' })).toEqual({ value: 0.5, unit: 'ft' })
    expect(distanceSchema.parse({ value: 120, unit: 'ft' })).toEqual({ value: 120, unit: 'ft' })
  })

  it('rejects negative values and non-ft units', () => {
    expect(distanceSchema.safeParse({ value: -1, unit: 'ft' }).success).toBe(false)
    expect(distanceSchema.safeParse({ value: 10, unit: 'm' }).success).toBe(false)
  })
})

describe('positiveDistanceSchema', () => {
  it('accepts positive whole and fractional feet', () => {
    expect(positiveDistanceSchema.parse({ value: 0.5, unit: 'ft' })).toEqual({
      value: 0.5,
      unit: 'ft',
    })
    expect(positiveDistanceSchema.parse({ value: 20, unit: 'ft' })).toEqual({
      value: 20,
      unit: 'ft',
    })
  })

  it('rejects zero and negative values', () => {
    expect(positiveDistanceSchema.safeParse({ value: 0, unit: 'ft' }).success).toBe(false)
    expect(positiveDistanceSchema.safeParse({ value: -1, unit: 'ft' }).success).toBe(false)
  })
})

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

describe('speedRateSchema', () => {
  it('accepts ft and mph units with fractional values', () => {
    expect(speedRateSchema.parse({ value: 60, unit: 'ft' })).toEqual({ value: 60, unit: 'ft' })
    expect(speedRateSchema.parse({ value: 1.5, unit: 'mph' })).toEqual({
      value: 1.5,
      unit: 'mph',
    })
  })

  it('rejects negative values and unknown units', () => {
    expect(speedRateSchema.safeParse({ value: -1, unit: 'ft' }).success).toBe(false)
    expect(speedRateSchema.safeParse({ value: 1, unit: 'kph' }).success).toBe(false)
  })
})

describe('getSpeedRateUnitAbbrev', () => {
  it('returns compact unit labels for forms', () => {
    expect(getSpeedRateUnitAbbrev('ft')).toBe('ft.')
    expect(getSpeedRateUnitAbbrev('mph')).toBe('mph')
  })
})

describe('parseSpeedRateString', () => {
  it('parses legacy catalog speed strings', () => {
    expect(parseSpeedRateString('60 ft.')).toEqual({ value: 60, unit: 'ft' })
    expect(parseSpeedRateString('4 mph')).toEqual({ value: 4, unit: 'mph' })
    expect(parseSpeedRateString('1½ mph')).toEqual({ value: 1.5, unit: 'mph' })
  })
})

describe('formatSpeedRate', () => {
  it('formats mount and vehicle speed rates', () => {
    expect(formatSpeedRate({ value: 60, unit: 'ft' })).toBe('60 ft.')
    expect(formatSpeedRate({ value: 1.5, unit: 'mph' })).toBe('1½ mph')
  })
})
