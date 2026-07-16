import { describe, it } from 'vitest'

import { expectParseFailure, expectParseSuccess } from '../test/helpers/expect-zod-result'
import { generateNamesRequestSchema } from './generation'

describe('generateNamesRequestSchema', () => {
  it('accepts a valid request', () => {
    expectParseSuccess(
      generateNamesRequestSchema.safeParse({
        conventionId: 'elvish-personal',
        count: 3,
        seed: 'test-seed',
        genderStyle: 'masculine',
        exclude: ['Aelar Amastacia'],
      }),
    )
  })

  it('rejects zero count', () => {
    expectParseFailure(generateNamesRequestSchema.safeParse({ conventionId: 'x', count: 0 }), {
      path: ['count'],
    })
  })

  it('rejects count above max', () => {
    expectParseFailure(generateNamesRequestSchema.safeParse({ conventionId: 'x', count: 51 }), {
      path: ['count'],
    })
  })
})
