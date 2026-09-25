import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { resetPortraitCrop, resolveEmblemLayoutMetrics } from '@rpg/contracts'

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

    const asset = {
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
    } as const
    const rendition = await generateMediaRendition({ asset, preset: 'portrait', crop })

    const metadata = await sharp(rendition.buffer).metadata()
    expect(metadata.width).toBeLessThanOrEqual(expected.width)
    expect(metadata.height).toBeLessThanOrEqual(expected.height)
    expect(metadata.width).toBe(metadata.height)
    const artwork = await generateMediaRendition({ asset, preset: 'artwork' })
    const artworkMetadata = await sharp(artwork.buffer).metadata()
    expect(artworkMetadata.width).toBe(1200)
    expect(artworkMetadata.height).toBe(900)
    expect(artworkMetadata.width! / artworkMetadata.height!).toBeCloseTo(4 / 3)
  })
})

describe('generateMediaRendition emblem layout', () => {
  it('renders a scaled emblem using shared layout metrics', async () => {
    const sourceWidth = 512
    const sourceHeight = 256
    const buffer = await sharp({
      create: {
        width: sourceWidth,
        height: sourceHeight,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer()

    const assetId = '00000000-0000-4000-8000-000000000098'
    storeMediaOriginal(assetId, 'png', buffer)

    await createMediaAssetRecord({
      _id: assetId,
      sessionId: '00000000-0000-4000-8000-000000000002',
      scopeKind: 'campaign-content',
      scopeKey: 'campaign-content:camp-emblem',
      campaignId: 'camp-emblem',
      createdByUserId: 'user-emblem',
      storageKey: `media/${assetId}/original.png`,
      originalFilename: 'emblem-source.png',
      mimeType: 'image/png',
      byteSize: buffer.byteLength,
      orientedWidth: sourceWidth,
      orientedHeight: sourceHeight,
      contentHash: 'emblem-hash',
      animated: false,
      lifecycle: 'ready',
      referenceCount: 0,
      leaseExpiresAt: new Date(Date.now() + 60_000),
    })

    const asset = {
      _id: assetId,
      sessionId: '00000000-0000-4000-8000-000000000002',
      scopeKind: 'campaign-content',
      scopeKey: 'campaign-content:camp-emblem',
      campaignId: 'camp-emblem',
      createdByUserId: 'user-emblem',
      storageKey: `media/${assetId}/original.png`,
      originalFilename: 'emblem-source.png',
      mimeType: 'image/png',
      byteSize: buffer.byteLength,
      orientedWidth: sourceWidth,
      orientedHeight: sourceHeight,
      contentHash: 'emblem-hash',
      animated: false,
      lifecycle: 'ready',
      referenceCount: 0,
      leaseExpiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as const
    const emblemLayout = { mode: 'contain' as const, scale: 0.75 }
    const metrics = resolveEmblemLayoutMetrics({
      source: { width: sourceWidth, height: sourceHeight },
      canvasSize: 256,
      layout: emblemLayout,
    })

    const rendition = await generateMediaRendition({ asset, preset: 'emblem', emblemLayout })
    const metadata = await sharp(rendition.buffer).metadata()

    expect(metadata.width).toBe(256)
    expect(metadata.height).toBe(256)
    expect(metrics.renderedWidth).toBe(192)
    expect(metrics.renderedHeight).toBe(96)
    expect(metrics.left).toBe(32)
    expect(metrics.top).toBe(80)
  })
})
