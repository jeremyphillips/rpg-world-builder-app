import { describe, expect, it } from 'vitest'

import type { ContentMedia } from './content-media'
import { remapContentMediaForDuplicate } from './remap-content-media-for-duplicate'

function sampleMedia(): ContentMedia {
  return {
    revision: 2,
    images: [
      { id: 'img-1', assetId: 'asset-a', alt: 'Front' },
      { id: 'img-2', assetId: 'asset-b', alt: 'Side' },
    ],
    roles: {
      primary: { imageId: 'img-1' },
      portrait: { imageId: 'img-1', presentation: { crop: { x: 0, y: 0, width: 1, height: 1 } } },
    },
  }
}

describe('remapContentMediaForDuplicate', () => {
  it('remaps attachment ids within the same scope while reusing asset ids', () => {
    let counter = 0
    const result = remapContentMediaForDuplicate({
      media: sampleMedia(),
      sourceScopeKey: 'campaign-content:camp-1',
      targetScopeKey: 'campaign-content:camp-1',
      createAttachmentId: () => `new-${++counter}`,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.assetReuse).toBe('same-scope')
    expect(result.media.revision).toBe(0)
    expect(result.media.images.map((image) => image.assetId)).toEqual(['asset-a', 'asset-b'])
    expect(result.media.images.map((image) => image.id)).toEqual(['new-1', 'new-2'])
    expect(result.media.roles.primary?.imageId).toBe('new-1')
    expect(result.media.roles.portrait?.imageId).toBe('new-1')
  })

  it('returns a copy plan for cross-scope duplication without authorizing source assets', () => {
    const result = remapContentMediaForDuplicate({
      media: sampleMedia(),
      sourceScopeKey: 'campaign-content:camp-1',
      targetScopeKey: 'campaign-content:camp-2',
      createAttachmentId: () => 'unused',
    })

    expect(result).toEqual({
      ok: false,
      reason: 'cross_scope_copy_required',
      copyPlan: { assetIds: ['asset-a', 'asset-b'] },
    })
  })
})
