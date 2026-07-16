import { describe, expect, it } from 'vitest'

import {
  copperToDisplayWealth,
  copperToWealth,
  formatWealth,
  formatWealthAsGold,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
} from './wealth'

describe('wealth primitives', () => {
  it('normalizes wealth and money to copper', () => {
    expect(wealthToCopper({ cp: 3, sp: 5, gp: 9, pp: 0 })).toBe(953)
    expect(moneyToCopper({ amount: 2, currency: 'gp' })).toBe(200)
  })

  it('subtracts mixed-denomination costs and formats remaining wealth', () => {
    const starting = { cp: 3, sp: 5, gp: 9, pp: 0 }
    const remaining = subtractFromWealth(starting, { amount: 4, currency: 'gp' })
    expect(remaining).toEqual({ cp: 3, sp: 5, gp: 5, pp: 0 })
    expect(formatWealth(remaining)).toBe('5 GP, 5 SP, 3 CP')
  })

  it('round-trips copper totals through copperToWealth', () => {
    expect(copperToWealth(953)).toEqual({ cp: 3, sp: 5, gp: 9, pp: 0 })
    expect(copperToWealth(0)).toEqual({ cp: 0, sp: 0, gp: 0, pp: 0 })
  })

  it('folds platinum into display denominations without showing PP', () => {
    expect(formatWealth({ cp: 0, sp: 0, gp: 0, pp: 2 })).toBe('20 GP')
    expect(copperToDisplayWealth(2500)).toEqual({ cp: 0, sp: 0, gp: 25, pp: 0 })
  })

  it('formats wealth as a single GP total', () => {
    expect(formatWealthAsGold({ cp: 0, sp: 0, gp: 90, pp: 0 })).toBe('90 GP')
    expect(formatWealthAsGold({ cp: 50, sp: 0, gp: 0, pp: 0 })).toBe('0 GP')
    expect(formatWealthAsGold({ cp: 0, sp: 0, gp: 0, pp: 1 })).toBe('10 GP')
  })
})
