import { describe, expect, it } from 'vitest'

import { vocabularyDisableAvailabilitySchema } from './vocabulary-disable-availability'

describe('vocabularyDisableAvailabilitySchema', () => {
  it('parses allowed preflight', () => {
    expect(vocabularyDisableAvailabilitySchema.parse({ status: 'allowed' })).toEqual({
      status: 'allowed',
    })
  })

  it('parses blocked preflight with content blockers', () => {
    const parsed = vocabularyDisableAvailabilitySchema.parse({
      status: 'blocked',
      blockers: [
        {
          kind: 'content',
          contentTypeKey: 'species',
          id: 'sp1',
          label: 'Elf',
          slug: 'elf',
        },
      ],
    })
    expect(parsed.status).toBe('blocked')
  })
})
