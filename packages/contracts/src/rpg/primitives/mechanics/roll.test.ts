import { describe, expect, it } from 'vitest'

import { averageRollValue, formatRollValue, rollSchema } from './roll'
import { rollValidationMessages } from './roll-messages'

describe('rollSchema', () => {
  it('accepts dice-only, flat-only, and combined rolls', () => {
    expect(rollSchema.parse({ dice: { count: 1, faces: 10 } })).toEqual({
      dice: { count: 1, faces: 10 },
    })
    expect(rollSchema.parse({ flat: 5 })).toEqual({ flat: 5 })
    expect(rollSchema.parse({ dice: { count: 2, faces: 4 }, flat: 4 })).toEqual({
      dice: { count: 2, faces: 4 },
      flat: 4,
    })
    expect(rollSchema.parse({ dice: { count: 1, faces: 8 }, flat: 2 })).toEqual({
      dice: { count: 1, faces: 8 },
      flat: 2,
    })
  })

  it('rejects empty rolls', () => {
    const result = rollSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(rollValidationMessages.atLeastOneRequired())
    }
  })
})

describe('formatRollValue', () => {
  it('formats representative roll strings', () => {
    expect(formatRollValue({ dice: { count: 1, faces: 10 } })).toBe('1d10')
    expect(formatRollValue({ dice: { count: 2, faces: 4 }, flat: 4 })).toBe('2d4+4')
    expect(formatRollValue({ dice: { count: 1, faces: 4 }, flat: 1 })).toBe('1d4+1')
    expect(formatRollValue({ flat: 5 })).toBe('5')
    expect(formatRollValue({ dice: { count: 1, faces: 6 }, flat: -1 })).toBe('1d6-1')
    expect(formatRollValue({ dice: { count: 1, faces: 8 }, flat: 2 })).toBe('1d8+2')
  })
})

describe('averageRollValue', () => {
  it('averages dice and adds flat', () => {
    expect(averageRollValue({ dice: { count: 1, faces: 8 } })).toBe(4.5)
    expect(averageRollValue({ flat: 1 })).toBe(1)
    expect(averageRollValue({ dice: { count: 2, faces: 4 }, flat: 4 })).toBe(9)
  })
})
