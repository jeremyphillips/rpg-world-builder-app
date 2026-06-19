import { describe, expect, it } from 'vitest'
import { CLASS_HIT_DICE, DIE_FACES, averageDiceRoll, dieFaceSchema, hitDieSchema } from './dice'

describe('dieFaceSchema', () => {
  it('accepts every standard die face', () => {
    for (const face of DIE_FACES) {
      expect(dieFaceSchema.parse(face)).toBe(face)
    }
  })

  it('rejects non-standard faces', () => {
    expect(dieFaceSchema.safeParse(3).success).toBe(false)
    expect(dieFaceSchema.safeParse(0).success).toBe(false)
  })
})

describe('hitDieSchema', () => {
  it('accepts the class hit-die range (d6–d12)', () => {
    for (const face of CLASS_HIT_DICE) {
      expect(hitDieSchema.parse(face)).toBe(face)
    }
  })

  it('rejects die faces outside the class range', () => {
    expect(hitDieSchema.safeParse(4).success).toBe(false)
    expect(hitDieSchema.safeParse(20).success).toBe(false)
  })
})

describe('averageDiceRoll', () => {
  it('returns 2.5 for 1d4', () => {
    expect(averageDiceRoll({ count: 1, faces: 4 })).toBe(2.5)
  })

  it('returns 4.5 for 1d8', () => {
    expect(averageDiceRoll({ count: 1, faces: 8 })).toBe(4.5)
  })

  it('returns 7 for 2d6', () => {
    expect(averageDiceRoll({ count: 2, faces: 6 })).toBe(7)
  })
})
