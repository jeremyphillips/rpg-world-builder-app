import { describe, expect, it } from 'vitest'

import { multiattackPositiveInt } from './multiattack-schemas'

describe('multiattackPositiveInt', () => {
  it('accepts integer numbers and numeric strings', () => {
    expect(multiattackPositiveInt(2)).toBe(2)
    expect(multiattackPositiveInt('3')).toBe(3)
  })

  it('rejects zero, fractions, and empty input', () => {
    expect(multiattackPositiveInt(0)).toBeUndefined()
    expect(multiattackPositiveInt(1.5)).toBeUndefined()
    expect(multiattackPositiveInt('')).toBeUndefined()
    expect(multiattackPositiveInt('x')).toBeUndefined()
  })
})
