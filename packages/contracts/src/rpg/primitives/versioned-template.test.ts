import { describe, expect, it } from 'vitest'

import {
  versionedTemplateMetadataSchema,
  versionedTemplateReferenceSchema,
} from './versioned-template'

describe('versionedTemplateMetadataSchema', () => {
  it('accepts authored discovery metadata with a semantic release version', () => {
    expect(
      versionedTemplateMetadataSchema.parse({
        id: 'classic-adventure',
        slug: 'classic-adventure',
        version: '1.0.0',
        name: 'Classic Adventure',
        description: '<p>A familiar fantasy starting point.</p>',
      }),
    ).toMatchObject({ version: '1.0.0', name: 'Classic Adventure' })
  })

  it.each(['1', 'v1.0.0', '1.0'])('rejects unsupported version %s', (version) => {
    expect(() =>
      versionedTemplateMetadataSchema.parse({
        id: 'classic-adventure',
        slug: 'classic-adventure',
        version,
        name: 'Classic Adventure',
      }),
    ).toThrow()
  })
})

describe('versionedTemplateReferenceSchema', () => {
  it('captures the stable id and exact release used by a consumer', () => {
    expect(
      versionedTemplateReferenceSchema.parse({ id: 'classic-adventure', version: '1.0.0' }),
    ).toEqual({ id: 'classic-adventure', version: '1.0.0' })
  })
})
