import { describe, expect, it } from 'vitest'

import { isRollFlatAmountPresent, joinSignedRollFlat, splitSignedRollFlat } from './roll-form-flat'

describe('splitSignedRollFlat', () => {
  it('splits positive and negative flats', () => {
    expect(splitSignedRollFlat(4)).toEqual({ flatOperator: '+', flatAmount: 4 })
    expect(splitSignedRollFlat(-1)).toEqual({ flatOperator: '-', flatAmount: 1 })
    expect(splitSignedRollFlat(undefined)).toEqual({ flatOperator: '+' })
  })
})

describe('joinSignedRollFlat', () => {
  it('joins operator and unsigned amount', () => {
    expect(joinSignedRollFlat('+', 4)).toBe(4)
    expect(joinSignedRollFlat('-', 1)).toBe(-1)
    expect(joinSignedRollFlat('+', 0)).toBeUndefined()
    expect(joinSignedRollFlat('+', undefined)).toBeUndefined()
  })
})

describe('isRollFlatAmountPresent', () => {
  it('treats zero as present but empty sentinels as absent', () => {
    expect(isRollFlatAmountPresent(0)).toBe(true)
    expect(isRollFlatAmountPresent(undefined)).toBe(false)
    expect(isRollFlatAmountPresent('')).toBe(false)
  })
})
