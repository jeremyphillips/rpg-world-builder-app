import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { paginatedItemsSchema } from './paginated-items'

describe('paginatedItemsSchema', () => {
  const itemSchema = z.object({ id: z.string().min(1) })

  it('accepts a non-empty page', () => {
    expect(
      paginatedItemsSchema(itemSchema).parse({
        items: [{ id: 'char-1' }],
        total: 3,
      }),
    ).toEqual({
      items: [{ id: 'char-1' }],
      total: 3,
    })
  })

  it('accepts an empty page with zero total', () => {
    expect(
      paginatedItemsSchema(itemSchema).parse({
        items: [],
        total: 0,
      }),
    ).toEqual({
      items: [],
      total: 0,
    })
  })

  it('rejects negative totals', () => {
    expect(
      paginatedItemsSchema(itemSchema).safeParse({
        items: [],
        total: -1,
      }).success,
    ).toBe(false)
  })
})
