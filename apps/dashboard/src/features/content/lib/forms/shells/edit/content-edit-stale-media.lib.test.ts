import { ApiError, contentMediaSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { extractStaleMediaFromError } from './content-edit-stale-media.lib'

const serverMedia = contentMediaSchema.parse({
  revision: 3,
  images: [
    {
      id: 'image-1',
      assetId: 'asset-1',
      alt: 'Server image',
    },
  ],
  roles: {},
})

describe('extractStaleMediaFromError', () => {
  it('extracts server media from a stale revision response', () => {
    const error = new ApiError(409, 'stale_revision', 'Media changed.', {
      media: serverMedia,
    })

    expect(extractStaleMediaFromError(error)).toEqual(serverMedia)
  })

  it.each([
    new Error('Network error'),
    new ApiError(400, 'stale_revision', 'Wrong status.', { media: serverMedia }),
    new ApiError(409, 'conflict', 'Wrong code.', { media: serverMedia }),
    new ApiError(409, 'stale_revision', 'Malformed media.', {
      media: { revision: 'three' },
    }),
  ])('ignores unrelated or malformed errors', (error) => {
    expect(extractStaleMediaFromError(error)).toBeUndefined()
  })
})
