import { describe, expect, it } from 'vitest'

import { contentUsageBlockerSchema } from './content-usage-blocker'

describe('contentUsageBlockerSchema', () => {
  it('parses kind: content blockers', () => {
    const parsed = contentUsageBlockerSchema.parse({
      kind: 'content',
      sourceKey: 'location_parent',
      contentTypeKey: 'species',
      id: 'abc123',
      label: 'Elf',
      slug: 'elf',
    })
    expect(parsed).toEqual({
      kind: 'content',
      sourceKey: 'location_parent',
      contentTypeKey: 'species',
      id: 'abc123',
      label: 'Elf',
      slug: 'elf',
    })
  })

  it('still parses existing kind: usage blockers', () => {
    const parsed = contentUsageBlockerSchema.parse({
      kind: 'usage',
      sourceKey: 'character_usage',
      usage: {
        kind: 'character',
        id: 'char-1',
        label: 'Aria',
        characterType: 'pc',
      },
    })
    expect(parsed.kind).toBe('usage')
  })
})
