import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { draftOptionalSelect } from './draft-form-schema-helpers'

const fruitSchema = z.enum(['apple', 'banana'])

describe('draftOptionalSelect', () => {
  const schema = z.object({
    fruit: draftOptionalSelect(fruitSchema),
  })

  it('accepts undefined and omits the key from output', () => {
    expect(schema.parse({})).toEqual({})
  })

  it('accepts the empty-string select sentinel', () => {
    expect(schema.parse({ fruit: '' })).toEqual({})
  })

  it('accepts a valid enum value', () => {
    expect(schema.parse({ fruit: 'apple' })).toEqual({ fruit: 'apple' })
  })

  it('rejects invalid non-empty values', () => {
    expect(schema.safeParse({ fruit: 'cherry' }).success).toBe(false)
  })
})
