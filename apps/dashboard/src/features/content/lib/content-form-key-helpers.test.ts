import { describe, expect, it } from 'vitest'

import {
  applyStableIdsForUpdate,
  deriveSlugForCreate,
  envelopeSlugFields,
  finalizeContentInput,
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

describe('envelopeSlugFields', () => {
  it('includes slug on create', () => {
    expect(envelopeSlugFields('Wood Elf')).toEqual({ slug: 'wood-elf' })
  })

  it('omits slug on update', () => {
    expect(envelopeSlugFields('Wood Elf', { entity: { slug: 'wood-elf' } })).toEqual({})
  })
})

describe('finalizeContentInput', () => {
  it('strips slug when editing', () => {
    const input = { name: 'Elf', slug: 'wood-elf' as string | undefined }
    expect(finalizeContentInput(input, { entity: { slug: 'wood-elf' } })).toEqual({ name: 'Elf' })
  })

  it('keeps slug on create', () => {
    const input = { name: 'Elf', slug: 'wood-elf' }
    expect(finalizeContentInput(input)).toEqual(input)
  })
})
