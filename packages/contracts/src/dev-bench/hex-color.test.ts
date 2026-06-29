import { describe, expect, it } from 'vitest'

import { hexColorSchema } from './hex-color'

describe('hexColorSchema', () => {
  it('accepts six-digit hex colors', () => {
    expect(hexColorSchema.safeParse('#6366f1').success).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(hexColorSchema.safeParse('6366f1').success).toBe(false)
    expect(hexColorSchema.safeParse('#63f').success).toBe(false)
  })
})
