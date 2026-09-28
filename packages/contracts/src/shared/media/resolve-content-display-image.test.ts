import { describe, expect, it } from 'vitest'

import { emptyContentMediaSchema } from './content-media'
import { createSystemRoleAssignment, createUploadRoleAssignment } from './content-media-source'
import { contentTypeSubject } from './system-image-subject'
import { getAvailableContentImages } from './get-available-content-images'
import { normalizePersistedContentMedia } from './normalize-persisted-content-media'
import {
  resolveContentDisplayImage,
  resolveContentDisplayImageAsOptional,
  resolveContentDisplayImagesByRole,
} from './resolve-content-display-image'

const resolveUploadSrc = () => '/api/media/upload.jpg'

describe('resolveContentDisplayImage', () => {
  it('derives a system class primary with no media and no crop', () => {
    const result = resolveContentDisplayImage({
      surface: 'compact',
      domain: 'class',
      media: emptyContentMediaSchema,
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
    })

    expect(result).toEqual({
      outcome: 'image',
      display: {
        src: 'assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg',
        role: 'primary',
        sourceKind: 'system',
        presentationTreatment: 'white-paper-knockout',
      },
    })
  })

  it('prefers an explicit uploaded primary assignment', () => {
    const result = resolveContentDisplayImage({
      surface: 'compact',
      domain: 'class',
      media: {
        revision: 0,
        images: [{ id: 'img-1', assetId: 'asset-1' }],
        roles: {
          primary: createUploadRoleAssignment('img-1'),
        },
      },
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      resolveUploadSrc,
    })

    expect(result.outcome).toBe('image')
    if (result.outcome !== 'image') return
    expect(result.display.sourceKind).toBe('upload')
    expect(result.display.src).toBe('/api/media/upload.jpg')
  })

  it('returns explicit system primary src plus saved crop', () => {
    const crop = { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }
    const result = resolveContentDisplayImage({
      surface: 'compact',
      domain: 'class',
      media: {
        revision: 0,
        images: [],
        roles: {
          primary: {
            ...createSystemRoleAssignment({
              imageSetId: 'srd-cc-5.2.1',
              subject: contentTypeSubject('classes'),
              assetRole: 'primary',
              slug: 'fighter',
            }),
            presentation: { mode: 'crop', crop },
          },
        },
      },
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
    })

    expect(result.outcome).toBe('image')
    if (result.outcome !== 'image') return
    expect(result.display.sourceKind).toBe('system')
    expect(result.display.src).toBe('assets/system/srd-cc-5.2.1/classes/primary/fighter.jpeg')
    expect(result.display.crop).toEqual(crop)
  })

  it('derives a system species primary with no media and no crop', () => {
    const result = resolveContentDisplayImage({
      surface: 'compact',
      domain: 'species',
      media: emptyContentMediaSchema,
      subject: contentTypeSubject('species'),
      slug: 'elf',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
    })

    expect(result).toEqual({
      outcome: 'image',
      display: {
        src: 'assets/system/srd-cc-5.2.1/species/primary/elf.jpeg',
        role: 'primary',
        sourceKind: 'system',
        presentationTreatment: 'white-paper-knockout',
      },
    })
  })

  it('prefers portrait over primary on compact character', () => {
    const result = resolveContentDisplayImage({
      surface: 'compact',
      domain: 'character',
      media: {
        revision: 0,
        images: [
          { id: 'portrait-img', assetId: 'portrait-asset' },
          { id: 'primary-img', assetId: 'primary-asset' },
        ],
        roles: {
          portrait: createUploadRoleAssignment('portrait-img'),
          primary: createUploadRoleAssignment('primary-img'),
        },
      },
      subject: contentTypeSubject('classes'),
      slug: '',
      contentSource: 'homebrew',
      resolveUploadSrc: (assetId) =>
        assetId === 'portrait-asset' ? '/portrait.jpg' : '/primary.jpg',
    })

    expect(result).toEqual({
      outcome: 'image',
      display: { src: '/portrait.jpg', role: 'portrait', sourceKind: 'upload' },
    })
  })

  it('uses primary only on detail character even when portrait exists', () => {
    const result = resolveContentDisplayImage({
      surface: 'detail',
      domain: 'character',
      media: {
        revision: 0,
        images: [
          { id: 'portrait-img', assetId: 'portrait-asset' },
          { id: 'primary-img', assetId: 'primary-asset' },
        ],
        roles: {
          portrait: createUploadRoleAssignment('portrait-img'),
          primary: createUploadRoleAssignment('primary-img'),
        },
      },
      subject: contentTypeSubject('classes'),
      slug: '',
      contentSource: 'homebrew',
      resolveUploadSrc: (assetId) =>
        assetId === 'portrait-asset' ? '/portrait.jpg' : '/primary.jpg',
    })

    expect(result).toEqual({
      outcome: 'image',
      display: { src: '/primary.jpg', role: 'primary', sourceKind: 'upload' },
    })
  })

  it('does not walk emblem on compact organization', () => {
    const result = resolveContentDisplayImage({
      surface: 'compact',
      domain: 'organization',
      media: {
        revision: 0,
        images: [{ id: 'emblem-img', assetId: 'emblem-asset' }],
        roles: {
          emblem: createUploadRoleAssignment('emblem-img'),
        },
      },
      subject: contentTypeSubject('organizations'),
      slug: 'silver-compass',
      contentSource: 'homebrew',
      resolveUploadSrc: () => '/emblem.jpg',
    })

    expect(result).toEqual({ outcome: 'fallback', fallback: 'organization' })
  })

  it('resolves portrait and primary independently for character media', () => {
    const portraitCrop = { x: 0.2, y: 0.1, width: 0.25, height: 0.25 }
    const primaryCrop = { x: 0, y: 0.05, width: 0.9, height: 0.675 }
    const byRole = resolveContentDisplayImagesByRole({
      domain: 'character',
      media: {
        revision: 0,
        images: [{ id: 'shared-img', assetId: 'shared-asset' }],
        roles: {
          portrait: {
            ...createUploadRoleAssignment('shared-img'),
            presentation: { mode: 'crop', crop: portraitCrop },
          },
          primary: {
            ...createUploadRoleAssignment('shared-img'),
            presentation: { mode: 'crop', crop: primaryCrop },
          },
        },
      },
      subject: contentTypeSubject('classes'),
      slug: '',
      contentSource: 'homebrew',
      resolveUploadSrc: () => '/shared.jpg',
    })

    expect(byRole.portrait).toEqual({
      src: '/shared.jpg',
      role: 'portrait',
      sourceKind: 'upload',
      crop: portraitCrop,
    })
    expect(byRole.primary).toEqual({
      src: '/shared.jpg',
      role: 'primary',
      sourceKind: 'upload',
      crop: primaryCrop,
    })
  })

  it('returns a semantic fallback key when nothing resolves', () => {
    expect(
      resolveContentDisplayImage({
        surface: 'compact',
        domain: 'class',
        subject: contentTypeSubject('classes'),
        slug: 'custom-archetype',
        contentSource: 'homebrew',
      }),
    ).toEqual({ outcome: 'fallback', fallback: 'class' })

    expect(
      resolveContentDisplayImageAsOptional({
        surface: 'compact',
        domain: 'class',
        subject: contentTypeSubject('classes'),
        slug: 'custom-archetype',
        contentSource: 'homebrew',
      }),
    ).toBeUndefined()
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
      domain: 'class',
      subject: contentTypeSubject('classes'),
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
      domain: 'species',
      subject: contentTypeSubject('species'),
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
        domain: 'class',
        subject: contentTypeSubject('classes'),
        slug: 'fighter-variant',
        contentSource: 'system',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual([])

    expect(
      getAvailableContentImages({
        media: emptyContentMediaSchema,
        domain: 'class',
        subject: contentTypeSubject('classes'),
        slug: 'fighter',
        contentSource: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual([])

    expect(
      getAvailableContentImages({
        media: emptyContentMediaSchema,
        domain: 'species',
        subject: contentTypeSubject('species'),
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
            subject: contentTypeSubject('classes'),
            assetRole: 'primary',
            slug: 'fighter',
          }),
        },
      },
      subject: contentTypeSubject('classes'),
      slug: 'fighter',
      contentSource: 'system',
      rulesetId: 'srd-cc-5.2.1',
      allowedRoles: ['primary'],
    })

    expect(normalized.roles).toEqual({})
  })
})
