import { describe, expect, it } from 'vitest'

import { creatureCommunicationSchema } from './communication'

describe('creatureCommunicationSchema', () => {
  it('accepts telepathy-only communication', () => {
    expect(creatureCommunicationSchema.parse({ telepathy: 60 })).toEqual({ telepathy: 60 })
  })

  it('accepts an empty object', () => {
    expect(creatureCommunicationSchema.parse({})).toEqual({})
  })
})
