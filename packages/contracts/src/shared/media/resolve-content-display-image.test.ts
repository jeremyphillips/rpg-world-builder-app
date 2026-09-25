import { describe, expect, it } from 'vitest'

import { emptyContentMediaSchema } from './content-media'
import { createSystemRoleAssignment, createUploadRoleAssignment } from './content-media-source'
import { getAvailableContentImages } from './get-available-content-images'
import { normalizePersistedContentMedia } from './normalize-persisted-content-media'
import { resolveContentDisplayImage } from './resolve-content-display-image'

const fallbackSrc = '/fallback-content.png'

describe('resolveContentDisplayImage', () => {
  it('derives a system class primary with no media and no crop', () => {
    const display = resolveContentDisplayImage({
      media: emptyContentMediaSchema,
      contentType: 'classes',
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      fallbackSrc,
    })

    expect(display).toEqual({
      src: 'assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg',
      sourceKind: 'system',
    })
  })

  it('prefers an explicit uploaded primary assignment', () => {
    const display = resolveContentDisplayImage({
      media: {
        revision: 0,
        images: [{ id: 'img-1', assetId: 'asset-1' }],
        roles: {
          primary: createUploadRoleAssignment('img-1'),
        },
      },
      contentType: 'classes',
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      fallbackSrc,
      resolveUploadSrc: () => '/api/media/upload.jpg',
    })

    expect(display.sourceKind).toBe('upload')
    expect(display.src).toBe('/api/media/upload.jpg')
  })

  it('returns explicit system primary src plus saved crop', () => {
    const crop = { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }
    const display = resolveContentDisplayImage({
      media: {
        revision: 0,
        images: [],
        roles: {
          primary: {
            ...createSystemRoleAssignment({
              imageSetId: 'srd-cc-5.2.1',
              contentType: 'classes',
              assetRole: 'primary',
              slug: 'fighter',
            }),
            presentation: { mode: 'crop', crop },
          },
        },
      },
      contentType: 'classes',
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      fallbackSrc,
    })

    expect(display.sourceKind).toBe('system')
    expect(display.src).toBe('assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg')
    expect(display.crop).toEqual(crop)
  })

  it('derives a system species primary with no media and no crop', () => {
    const display = resolveContentDisplayImage({
      media: emptyContentMediaSchema,
      contentType: 'species',
      slug: 'elf',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      fallbackSrc,
    })

    expect(display).toEqual({
      src: 'assets/system/srd-cc-5.2.1/species/primary/elf.jpeg',
      sourceKind: 'system',
    })
  })

  it('falls back to imageKey and then the fallback image', () => {
    expect(
      resolveContentDisplayImage({
        contentType: 'classes',
        slug: 'custom-archetype',
        contentSource: 'homebrew',
        imageKey: 'uploads/custom.jpg',
        fallbackSrc,
      }).src,
    ).toContain('uploads/custom.jpg')

    expect(
      resolveContentDisplayImage({
        contentType: 'classes',
        slug: 'custom-archetype',
        contentSource: 'homebrew',
        fallbackSrc,
      }),
    ).toEqual({ src: fallbackSrc, sourceKind: 'fallback' })
  })
})

describe('getAvailableContentImages', () => {
  it('returns uploads plus a virtual system source without copying it into media.images', () => {
    const available = getAvailableContentImages({
      media: {
        revision: 0,
        images: [{ id: 'img-1', assetId: 'asset-1' }],
        roles: {},
      },
      contentType: 'classes',
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
    })

    expect(available).toHaveLength(2)
    expect(available[0]?.kind).toBe('upload')
    expect(available[1]).toMatchObject({
      kind: 'system',
      srcPath: 'assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg',
    })
  })

  it('includes a virtual species source only for system content', () => {
    const available = getAvailableContentImages({
      media: emptyContentMediaSchema,
      contentType: 'species',
      slug: 'human',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
    })

    expect(available).toHaveLength(1)
    expect(available[0]).toMatchObject({
      kind: 'system',
      srcPath: 'assets/system/srd-cc-5.2.1/species/primary/human.jpeg',
    })
  })

  it('does not derive fighter art for a different slug or homebrew source', () => {
    expect(
      getAvailableContentImages({
        media: emptyContentMediaSchema,
        contentType: 'classes',
        slug: 'fighter-variant',
        contentSource: 'system',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual([])

    expect(
      getAvailableContentImages({
        media: emptyContentMediaSchema,
        contentType: 'classes',
        slug: 'fighter',
        contentSource: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual([])

    expect(
      getAvailableContentImages({
        media: emptyContentMediaSchema,
        contentType: 'species',
        slug: 'elf',
        contentSource: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual([])
  })
})

describe('normalizePersistedContentMedia', () => {
  it('leaves media.roles empty when only the derived default is present', () => {
    const normalized = normalizePersistedContentMedia({
      media: {
        revision: 0,
        images: [],
        roles: {
          primary: createSystemRoleAssignment({
            imageSetId: 'srd-cc-5.2.1',
            contentType: 'classes',
            assetRole: 'primary',
            slug: 'fighter',
          }),
        },
      },
      contentType: 'classes',
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      allowedRoles: ['primary'],
    })

    expect(normalized.roles).toEqual({})
  })
})
