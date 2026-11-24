import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  CONTEXTUAL_COUNT_IN_LAIR_MUST_EXCEED_NORMAL_MESSAGE,
  refineContextualCountInLairExceedsNormal,
} from './refine-contextual-count-in-lair'

describe('refineContextualCountInLairExceedsNormal', () => {
  it('rejects in-lair at or below normal', () => {
    const schema = z
      .object({ uses: z.record(z.string(), z.unknown()) })
      .superRefine((body, ctx) => {
        refineContextualCountInLairExceedsNormal(
          body.uses as { normal?: number; inLair?: number },
          ctx,
          ['uses', 'inLair'],
        )
      })
    expect(schema.safeParse({ uses: { normal: 3, inLair: 3 } }).success).toBe(false)
    expect(schema.safeParse({ uses: { normal: 4, inLair: 3 } }).success).toBe(false)
    expect(schema.safeParse({ uses: { normal: 3, inLair: 4 } }).success).toBe(true)
    expect(schema.safeParse({ uses: { normal: 3 } }).success).toBe(true)
  })

  it('surfaces the shared message', () => {
    const schema = z
      .object({ uses: z.record(z.string(), z.unknown()) })
      .superRefine((body, ctx) => {
        refineContextualCountInLairExceedsNormal(
          body.uses as { normal?: number; inLair?: number },
          ctx,
          ['uses', 'inLair'],
        )
      })
    const result = schema.safeParse({ uses: { normal: 3, inLair: 2 } })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(
      result.error.issues.some(
        (i) => i.message === CONTEXTUAL_COUNT_IN_LAIR_MUST_EXCEED_NORMAL_MESSAGE,
      ),
    ).toBe(true)
  })
})
