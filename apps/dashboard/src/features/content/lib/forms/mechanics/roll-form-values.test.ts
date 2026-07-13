import { describe, expect, it } from 'vitest'

import {
  joinSignedRollFlat,
  normalizeRollFormValue,
  rollToFormShape,
  splitSignedRollFlat,
  type RollFormShape,
} from './roll-form-values'

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

describe('normalizeRollFormValue', () => {
  it('normalizes dice-only, flat-only, and dice+flat rolls', () => {
    expect(normalizeRollFormValue({ dice: { count: 1, faces: 8 } })).toEqual({
      dice: { count: 1, faces: 8 },
    })
    expect(normalizeRollFormValue({ flatOperator: '+', flatAmount: 1 })).toEqual({ flat: 1 })
    expect(
      normalizeRollFormValue({
        dice: { count: 1, faces: 4 },
        flatOperator: '+',
        flatAmount: 1,
      }),
    ).toEqual({
      dice: { count: 1, faces: 4 },
      flat: 1,
    })
    expect(
      normalizeRollFormValue({
        dice: { count: 2, faces: 4 },
        flatOperator: '+',
        flatAmount: 4,
      }),
    ).toEqual({
      dice: { count: 2, faces: 4 },
      flat: 4,
    })
    expect(
      normalizeRollFormValue({
        dice: { count: 1, faces: 6 },
        flatOperator: '-',
        flatAmount: 1,
      }),
    ).toEqual({
      dice: { count: 1, faces: 6 },
      flat: -1,
    })
  })

  it('rejects invalid die faces', () => {
    expect(
      normalizeRollFormValue({
        dice: { count: 1, faces: 7 },
      } as unknown as RollFormShape),
    ).toBeUndefined()
  })

  it('omits flat when amount is empty or zero', () => {
    expect(
      normalizeRollFormValue({
        dice: { count: 1, faces: 6 },
        flatOperator: '+',
      }),
    ).toEqual({
      dice: { count: 1, faces: 6 },
    })
    expect(
      normalizeRollFormValue({
        dice: { count: 1, faces: 6 },
        flatOperator: '+',
        flatAmount: 0,
      }),
    ).toEqual({
      dice: { count: 1, faces: 6 },
    })
  })
})

describe('rollToFormShape', () => {
  it('round-trips through normalizeRollFormValue', () => {
    const roll = { dice: { count: 2, faces: 6 as const }, flat: 4 }
    expect(normalizeRollFormValue(rollToFormShape(roll))).toEqual(roll)
    expect(rollToFormShape({ dice: { count: 1, faces: 8 as const } })).toEqual({
      dice: { count: 1, faces: 8 },
      flatOperator: '+',
      flatAmount: 0,
    })
    expect(rollToFormShape({ flat: -2 })).toEqual({
      flatOperator: '-',
      flatAmount: 2,
    })
  })
})
