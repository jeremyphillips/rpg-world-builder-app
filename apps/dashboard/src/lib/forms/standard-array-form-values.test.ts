import { describe, expect, it } from 'vitest'
import { DEFAULT_STANDARD_ARRAY } from '@rpg/contracts'

import {
  parseStandardArrayFormValues,
  standardArrayDefaultFormValues,
  standardArrayFormSchema,
} from './standard-array-form-values'

describe('standardArrayFormSchema', () => {
  it('accepts the default array and coerces string inputs', () => {
    expect(standardArrayFormSchema.parse([...DEFAULT_STANDARD_ARRAY])).toEqual([
      15, 14, 13, 12, 10, 8,
    ])
    expect(standardArrayFormSchema.parse(['15', '14', '13', '12', '10', '8'])).toEqual([
      15, 14, 13, 12, 10, 8,
    ])
  })

  it('rejects out-of-range scores per standardArraySchema', () => {
    expect(standardArrayFormSchema.safeParse([15, 14, 13, 12, 10, 0]).success).toBe(false)
    expect(standardArrayFormSchema.safeParse([15, 14, 13, 12, 10, 21]).success).toBe(false)
  })

  it('rejects arrays that are not exactly six values', () => {
    expect(standardArrayFormSchema.safeParse([15, 14, 13]).success).toBe(false)
  })
})

describe('parseStandardArrayFormValues', () => {
  it('parses through standardArrayFormSchema', () => {
    expect(parseStandardArrayFormValues(standardArrayDefaultFormValues())).toEqual([
      ...DEFAULT_STANDARD_ARRAY,
    ])
  })
})
