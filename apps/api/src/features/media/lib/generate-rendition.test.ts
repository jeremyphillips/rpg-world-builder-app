import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { resetPortraitCrop } from '@rpg/contracts'

import { createMediaAssetRecord } from '../media.repository'
import { cropPixelDimensions, generateMediaRendition } from './generate-rendition.lib'
import { storeMediaOriginal } from './storage.lib'
import { useIntegrationDb } from '../../../test/setup/integration-db'

useIntegrationDb()

describe('generateMediaRendition crop parity', () => {
  it('matches oriented crop pixels between geometry helpers and sharp output', async () => {
    const sourceWidth = 1600
    const sourceHeight = 900
    const buffer = await sharp({
      create: {
        width: sourceWidth,
        height: sourceHeight,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .png()
      .toBuffer()

    const assetId = '00000000-0000-4000-8000-000000000099'
    storeMediaOriginal(assetId, 'png', buffer)

    await createMediaAssetRecord({
      _id: assetId,
      sessionId: '00000000-0000-4000-8000-000000000001',
      scopeKind: 'campaign-content',
      scopeKey: 'campaign-content:camp-parity',
      campaignId: 'camp-parity',
      createdByUserId: 'user-parity',
      storageKey: `media/${assetId}/original.png`,
      originalFilename: 'landscape.png',
      mimeType: 'image/png',
      byteSize: buffer.byteLength,
      orientedWidth: sourceWidth,
      orientedHeight: sourceHeight,
      contentHash: 'parity-hash',
      animated: false,
      lifecycle: 'ready',
      referenceCount: 0,
      leaseExpiresAt: new Date(Date.now() + 60_000),
    })

    const crop = resetPortraitCrop({ width: sourceWidth, height: sourceHeight })
    const expected = cropPixelDimensions(crop, sourceWidth, sourceHeight)

    const rendition = await generateMediaRendition({
      asset: {
        _id: assetId,
        sessionId: '00000000-0000-4000-8000-000000000001',
        scopeKind: 'campaign-content',
        scopeKey: 'campaign-content:camp-parity',
        campaignId: 'camp-parity',
        createdByUserId: 'user-parity',
        storageKey: `media/${assetId}/original.png`,
        originalFilename: 'landscape.png',
        mimeType: 'image/png',
        byteSize: buffer.byteLength,
        orientedWidth: sourceWidth,
        orientedHeight: sourceHeight,
        contentHash: 'parity-hash',
        animated: false,
        lifecycle: 'ready',
        referenceCount: 0,
        leaseExpiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      preset: 'portrait',
      crop,
    })

    const metadata = await sharp(rendition.buffer).metadata()
    expect(metadata.width).toBeLessThanOrEqual(expected.width)
    expect(metadata.height).toBeLessThanOrEqual(expected.height)
    expect(metadata.width).toBe(metadata.height)
  })
})
