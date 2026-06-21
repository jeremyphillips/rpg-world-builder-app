import { describe, expect, it } from 'vitest'

import {
  applyStableIdsForUpdate,
  deriveSlugForCreate,
  stripSlugFromInput,
} from './content-form-key-helpers'

describe('deriveSlugForCreate', () => {
  it('derives a slugSchema-valid key from a display name', () => {
    expect(deriveSlugForCreate('Wood Elf')).toBe('wood-elf')
  })
})

describe('applyStableIdsForUpdate', () => {
  it('preserves existing ids and derives new ones', () => {
    const existing = [{ id: 'darkvision' }]
    const rows = [{ id: 'darkvision', name: 'Superior Darkvision' }, { name: 'Keen Senses' }]

    expect(applyStableIdsForUpdate(rows, existing)).toEqual([
      { id: 'darkvision', name: 'Superior Darkvision' },
      { id: 'keen-senses', name: 'Keen Senses' },
    ])
  })
})

describe('stripSlugFromInput', () => {
  it('removes slug from update payloads', () => {
    expect(stripSlugFromInput({ name: 'Elf', slug: 'elf', description: 'x' })).toEqual({
      name: 'Elf',
      description: 'x',
    })
  })
})
