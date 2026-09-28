import {
  contentMediaSchema,
  createUploadRoleAssignment,
  emptyContentMediaSchema,
} from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'

import {
  hasAuthoredContentMedia,
  isManagedContentMediaDirty,
  serializeContentFormInput,
} from './content-form-serialize-input.lib'

const mediaEnabledDef = {
  routeKey: 'classes',
  supportsManagedMedia: true as const,
  mediaDomain: 'class' as const,
  toInput: vi.fn(() => ({ name: 'Test Class' })),
}

const authoredMedia = contentMediaSchema.parse({
  revision: 1,
  images: [{ id: 'image-1', assetId: 'asset-1' }],
  roles: {},
})

describe('isManagedContentMediaDirty', () => {
  it('treats media: true as dirty', () => {
    expect(isManagedContentMediaDirty({ media: true })).toBe(true)
  })

  it('treats nested media dirty objects as dirty', () => {
    expect(isManagedContentMediaDirty({ media: { images: { 0: true } } })).toBe(true)
  })

  it('returns false when media is untouched', () => {
    expect(isManagedContentMediaDirty({ name: true })).toBe(false)
    expect(isManagedContentMediaDirty({})).toBe(false)
  })
})

describe('hasAuthoredContentMedia', () => {
  it('returns false for canonical empty media', () => {
    expect(hasAuthoredContentMedia(emptyContentMediaSchema)).toBe(false)
  })

  it('returns true when gallery images exist', () => {
    expect(hasAuthoredContentMedia(authoredMedia)).toBe(true)
  })
})

describe('serializeContentFormInput', () => {
  const baseValues = { name: 'Test', media: emptyContentMediaSchema }

  it('update: omits media when media is not dirty', () => {
    const result = serializeContentFormInput(
      mediaEnabledDef,
      { ...baseValues, media: authoredMedia },
      undefined,
      'publish',
      { operation: 'update', dirtyFields: { name: true } },
    ) as Record<string, unknown>

    expect(result.media).toBeUndefined()
  })

  it('update: persists populated media when dirty', () => {
    const result = serializeContentFormInput(
      mediaEnabledDef,
      { ...baseValues, media: authoredMedia },
      undefined,
      'publish',
      { operation: 'update', dirtyFields: { media: true } },
    ) as Record<string, unknown>

    expect(result.media).toEqual(authoredMedia)
    expect(result.expectedMediaRevision).toBe(1)
  })

  it('update: persists canonical empty media when clearing override', () => {
    const result = serializeContentFormInput(
      mediaEnabledDef,
      { ...baseValues, media: emptyContentMediaSchema },
      undefined,
      'publish',
      { operation: 'update', dirtyFields: { media: { images: true } } },
    ) as Record<string, unknown>

    expect(result.media).toEqual(emptyContentMediaSchema)
  })

  it('create: omits media when nothing authored', () => {
    const result = serializeContentFormInput(mediaEnabledDef, baseValues, undefined, 'publish', {
      operation: 'create',
    }) as Record<string, unknown>

    expect(result.media).toBeUndefined()
  })

  it('create: includes authored media even when not dirty', () => {
    const result = serializeContentFormInput(
      mediaEnabledDef,
      { ...baseValues, media: authoredMedia },
      undefined,
      'publish',
      { operation: 'create', dirtyFields: {} },
    ) as Record<string, unknown>

    expect(result.media).toEqual(authoredMedia)
    expect(result.expectedMediaRevision).toBe(1)
  })

  it('throws when upload roles reference missing gallery attachments', () => {
    expect(() =>
      serializeContentFormInput(
        mediaEnabledDef,
        {
          ...baseValues,
          media: contentMediaSchema.parse({
            revision: 0,
            images: [],
            roles: { primary: createUploadRoleAssignment('missing') },
          }),
        },
        undefined,
        'publish',
        { operation: 'update', dirtyFields: { media: true } },
      ),
    ).toThrow(/missing attachment/)
  })

  it('skips media merge when def does not support managed media', () => {
    const def = {
      routeKey: 'spells',
      supportsManagedMedia: false,
      toInput: vi.fn(() => ({ name: 'Spell' })),
    }

    const result = serializeContentFormInput(
      def,
      { name: 'Spell', media: authoredMedia },
      undefined,
      'publish',
      { operation: 'create' },
    ) as Record<string, unknown>

    expect(result.media).toBeUndefined()
  })
})
