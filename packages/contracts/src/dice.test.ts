import { describe, expect, it } from 'vitest'
import { CLASS_HIT_DICE, DIE_FACES, dieFaceSchema, hitDieSchema } from './dice'

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
