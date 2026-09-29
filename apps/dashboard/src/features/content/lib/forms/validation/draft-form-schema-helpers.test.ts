import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import { draftOptionalSelect, formSelectNumberSchema } from './draft-form-schema-helpers'

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

describe('formSelectNumberSchema', () => {
  const prioritySchema = z.union([z.literal(10), z.literal(40)])
  const schema = z.object({
    priority: formSelectNumberSchema(prioritySchema),
  })

  it('accepts numeric literals and numeric strings', () => {
    expect(schema.parse({ priority: 40 })).toEqual({ priority: 40 })
    expect(schema.parse({ priority: '40' })).toEqual({ priority: 40 })
  })

  it('rejects out-of-vocab numeric strings', () => {
    expect(schema.safeParse({ priority: '99' }).success).toBe(false)
  })

  it('rejects non-numeric strings', () => {
    expect(schema.safeParse({ priority: 'high' }).success).toBe(false)
  })

  it('does not coerce empty string to zero', () => {
    expect(schema.safeParse({ priority: '' }).success).toBe(false)
    expect(z.coerce.number().safeParse('').success).toBe(true)
  })
})
