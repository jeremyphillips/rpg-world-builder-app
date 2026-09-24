import { describe, expect, it } from 'vitest'

import type { ContentMedia } from './content-media'
import { getContentMediaPolicy } from './media-policy'
import { validateContentMedia } from './validate-content-media'

const assetDimensions = {
  'asset-large': { orientedWidth: 512, orientedHeight: 512 },
  'asset-small': { orientedWidth: 64, orientedHeight: 64 },
}

function baseMedia(overrides: Partial<ContentMedia> = {}): ContentMedia {
  return {
    revision: 0,
    images: [{ id: 'img-1', assetId: 'asset-large', alt: 'Hero' }],
    roles: {},
    ...overrides,
  }
}

describe('validateContentMedia', () => {
  it('accepts a valid primary-only class gallery', () => {
    const result = validateContentMedia(baseMedia({ roles: { primary: { imageId: 'img-1' } } }), {
      policy: getContentMediaPolicy('class'),
      assetDimensionsById: assetDimensions,
    })

    expect(result.ok).toBe(true)
  })

  it('rejects portrait on primary-only domains', () => {
    const result = validateContentMedia(baseMedia({ roles: { portrait: { imageId: 'img-1' } } }), {
      policy: getContentMediaPolicy('species'),
      assetDimensionsById: assetDimensions,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.some((issue) => issue.path.includes('portrait'))).toBe(true)
  })

  it('rejects dangling role references and duplicate attachments', () => {
    const dangling = validateContentMedia(
      baseMedia({ roles: { primary: { imageId: 'missing' } } }),
      {
        policy: getContentMediaPolicy('location'),
        assetDimensionsById: assetDimensions,
      },
    )
    expect(dangling.ok).toBe(false)

    const duplicateIds = validateContentMedia(
      baseMedia({
        images: [
          { id: 'img-1', assetId: 'asset-large' },
          { id: 'img-1', assetId: 'asset-small' },
        ],
      }),
      {
        policy: getContentMediaPolicy('organization'),
        assetDimensionsById: assetDimensions,
      },
    )
    expect(duplicateIds.ok).toBe(false)

    const duplicateAssets = validateContentMedia(
      baseMedia({
        images: [
          { id: 'img-1', assetId: 'asset-large' },
          { id: 'img-2', assetId: 'asset-large' },
        ],
      }),
      {
        policy: getContentMediaPolicy('equipment'),
        assetDimensionsById: assetDimensions,
      },
    )
    expect(duplicateAssets.ok).toBe(false)
  })

  it('requires square, sufficiently large portrait crops for characters', () => {
    const tooSmall = validateContentMedia(
      baseMedia({
        images: [{ id: 'img-1', assetId: 'asset-small' }],
        roles: { portrait: { imageId: 'img-1' } },
      }),
      {
        policy: getContentMediaPolicy('character'),
        assetDimensionsById: assetDimensions,
      },
    )
    expect(tooSmall.ok).toBe(false)

    const validPortrait = validateContentMedia(
      baseMedia({
        roles: {
          portrait: {
            imageId: 'img-1',
            presentation: { mode: 'crop', crop: { x: 0, y: 0, width: 1, height: 1 } },
          },
        },
      }),
      {
        policy: getContentMediaPolicy('character'),
        assetDimensionsById: assetDimensions,
      },
    )
    expect(validPortrait.ok).toBe(true)
  })

  it('rejects out-of-bounds portrait crops', () => {
    const result = validateContentMedia(
      baseMedia({
        roles: {
          portrait: {
            imageId: 'img-1',
            presentation: { mode: 'crop', crop: { x: 0.8, y: 0, width: 0.5, height: 0.5 } },
          },
        },
      }),
      {
        policy: getContentMediaPolicy('character'),
        assetDimensionsById: assetDimensions,
      },
    )

    expect(result.ok).toBe(false)
  })
})
