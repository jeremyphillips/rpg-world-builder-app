import { describe, expect, it } from 'vitest'

import { rechargeValueFromRaw } from './monster-action-recharge'

describe('rechargeValueFromRaw', () => {
  it('clears on a blank input and keeps the last value for anything that is not a d6 threshold', () => {
    expect(rechargeValueFromRaw('')).toBeUndefined()
    expect(rechargeValueFromRaw('  ')).toBeUndefined()
    expect(rechargeValueFromRaw('1')).toBe('unchanged')
    expect(rechargeValueFromRaw('7')).toBe('unchanged')
    expect(rechargeValueFromRaw('2.5')).toBe('unchanged')
    expect(rechargeValueFromRaw('x')).toBe('unchanged')
  })

  it('writes a complete recharge object for a threshold from 2 through 6', () => {
    expect(rechargeValueFromRaw('5')).toEqual({ kind: 'recharge', minRoll: 5 })
    expect(rechargeValueFromRaw('6')).toEqual({ kind: 'recharge', minRoll: 6 })
  })
})
