import { describe, expect, it } from 'vitest'

import {
  applyStableIdsForChoiceOptions,
  applyStableIdsForUpdate,
  deriveSlugForCreate,
  envelopeSlugFields,
  finalizeContentInput,
  slugForInputParse,
  stripEditEnvelopeFromFormDefaults,
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

describe('applyStableIdsForChoiceOptions', () => {
  it('preserves existing ids and derives new ones from labels', () => {
    const existing = [{ id: 'standard' }]
    const rows = [{ id: 'standard', label: 'Standard Equipment' }, { label: 'Starting Gold' }]

    expect(applyStableIdsForChoiceOptions(rows, existing)).toEqual([
      { id: 'standard', label: 'Standard Equipment' },
      { id: 'starting-gold', label: 'Starting Gold' },
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

describe('slugForInputParse', () => {
  it('uses entity slug on update for schema parse', () => {
    expect(slugForInputParse('Renamed', { entity: { slug: 'original-slug' } })).toBe(
      'original-slug',
    )
  })

  it('derives slug on create', () => {
    expect(slugForInputParse('Wood Elf')).toBe('wood-elf')
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

describe('stripEditEnvelopeFromFormDefaults', () => {
  it('removes slug from edit defaults', () => {
    expect(
      stripEditEnvelopeFromFormDefaults({
        name: 'Athletics',
        slug: 'athletics',
        description: 'Jump farther.',
      }),
    ).toEqual({ name: 'Athletics', description: 'Jump farther.' })
  })

  it('removes kind when route-scoped equipment edit omits the kind field', () => {
    expect(
      stripEditEnvelopeFromFormDefaults(
        { name: 'Lute', slug: 'lute', kind: 'tool', description: 'A stringed instrument.' },
        { stripKind: true },
      ),
    ).toEqual({ name: 'Lute', description: 'A stringed instrument.' })
  })
})
