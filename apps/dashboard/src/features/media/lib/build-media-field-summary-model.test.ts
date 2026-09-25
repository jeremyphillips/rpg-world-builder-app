import { describe, expect, it } from 'vitest'

import { COMPACT_MEDIA_FIELD_PRESENTATION } from './media-field-config'
import { buildMediaFieldSummaryModel } from './build-media-field-summary-model'

describe('buildMediaFieldSummaryModel', () => {
  it('returns empty gallery metadata for blank media', () => {
    const model = buildMediaFieldSummaryModel({
      config: { domain: 'character', presentation: COMPACT_MEDIA_FIELD_PRESENTATION },
      media: { revision: 0, images: [], roles: {} },
    })

    expect(model.items).toEqual([])
    expect(model.attachmentCount).toBe(0)
    expect(model.galleryCount).toBe(0)
    expect(model.representativeId).toBeUndefined()
  })

  it('maps uploaded attachments to summary items', () => {
    const model = buildMediaFieldSummaryModel({
      config: { domain: 'character', presentation: COMPACT_MEDIA_FIELD_PRESENTATION },
      media: {
        revision: 1,
        images: [{ id: 'img-1', assetId: 'asset-1', alt: 'Portrait' }],
        roles: {},
      },
    })

    expect(model.attachmentCount).toBe(1)
    expect(model.items).toHaveLength(1)
    expect(model.items[0]?.id).toBe('img-1')
    expect(model.items[0]?.src).toContain('asset-1')
  })
})
