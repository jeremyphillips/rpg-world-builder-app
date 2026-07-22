import { describe, expect, it } from 'vitest'

import { authoredContentBodySchema } from './authored-content'

describe('authoredContentBodySchema', () => {
  it('accepts the shared fields for named authored content', () => {
    expect(
      authoredContentBodySchema.parse({
        name: 'The Silver Compass',
        description: '<p>A far-reaching explorers guild.</p>',
        imageKey: 'organizations/silver-compass.webp',
      }),
    ).toEqual({
      name: 'The Silver Compass',
      description: '<p>A far-reaching explorers guild.</p>',
      imageKey: 'organizations/silver-compass.webp',
    })
  })

  it('requires a non-empty name while leaving prose and artwork optional', () => {
    expect(authoredContentBodySchema.parse({ name: 'The Silver Compass' })).toEqual({
      name: 'The Silver Compass',
    })
    expect(authoredContentBodySchema.safeParse({ name: '' }).success).toBe(false)
  })
})
