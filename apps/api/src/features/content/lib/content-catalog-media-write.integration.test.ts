import { randomUUID } from 'node:crypto'

import { beforeEach, describe, expect, it } from 'vitest'

import { catalogContentMediaExpectedRevisionField, emptyContentMediaSchema } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { setMongoTransactionsEnabled } from '../../../lib/mongo-transaction'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createMediaAssetRecord } from '../../media/media.repository'
import { ClassPatchModel } from '../classes/class-patch.model'
import { classWriteConfig } from '../classes/classes.config'
import { resolveCatalogForCampaign } from '../content.service'
import { updateContentEntity } from './content-write.service'

useIntegrationDb()

async function seedCampaignAsset(campaignId: string) {
  const assetId = randomUUID()
  await createMediaAssetRecord({
    _id: assetId,
    sessionId: randomUUID(),
    scopeKind: 'campaign-content',
    scopeKey: `campaign-content:${campaignId}`,
    campaignId,
    createdByUserId: 'user-1',
    storageKey: `media/${assetId}/original.png`,
    originalFilename: 'sample.png',
    mimeType: 'image/png',
    byteSize: 128,
    orientedWidth: 1200,
    orientedHeight: 900,
    contentHash: randomUUID(),
    animated: false,
    lifecycle: 'ready',
    referenceCount: 0,
    leaseExpiresAt: new Date(Date.now() + 60_000),
  })
  return assetId
}

describe('catalog content media write integration', () => {
  beforeEach(() => {
    setMongoTransactionsEnabled(true)
  })

  it('persists gallery-only media on a system class overlay and omits media on unrelated patch', async () => {
    const campaign = await makeTestCampaign()
    const assetId = await seedCampaignAsset(campaign.id)

    const catalog = await resolveCatalogForCampaign(classWriteConfig.readConfig, campaign.id)
    const fighter = catalog.find(
      (record) => record.slug === 'fighter' && record.source === 'system',
    )
    expect(fighter).toBeDefined()
    if (!fighter) throw new Error('expected fighter seed')

    const galleryMedia = {
      revision: 0,
      images: [{ id: 'img-gallery-1', assetId }],
      roles: {},
    }

    const updated = await updateContentEntity(classWriteConfig, campaign.id, fighter.id, {
      media: galleryMedia,
      [catalogContentMediaExpectedRevisionField]: 0,
    })
    expect(updated.media?.images).toEqual(galleryMedia.images)
    expect(updated.media?.revision).toBeGreaterThan(0)

    const patchDoc = await ClassPatchModel.findOne({
      campaignId: campaign.id,
      targetId: fighter.id,
    }).lean<{ patch?: { media?: typeof galleryMedia } }>()
    expect(patchDoc?.patch?.media?.images).toEqual(galleryMedia.images)

    const catalogAfterMedia = await resolveCatalogForCampaign(
      classWriteConfig.readConfig,
      campaign.id,
    )
    const patched = catalogAfterMedia.find((record) => record.id === fighter.id)
    expect(patched?.media?.images).toEqual(galleryMedia.images)

    await updateContentEntity(classWriteConfig, campaign.id, fighter.id, {
      name: fighter.name,
    })

    const afterNameOnly = await resolveCatalogForCampaign(classWriteConfig.readConfig, campaign.id)
    const reloaded = afterNameOnly.find((record) => record.id === fighter.id)
    expect(reloaded?.media?.images).toEqual(galleryMedia.images)

    await updateContentEntity(classWriteConfig, campaign.id, fighter.id, {
      media: emptyContentMediaSchema,
      [catalogContentMediaExpectedRevisionField]: patched?.media?.revision ?? 1,
    })

    const afterClear = await resolveCatalogForCampaign(classWriteConfig.readConfig, campaign.id)
    const cleared = afterClear.find((record) => record.id === fighter.id)
    expect(cleared?.media?.images).toEqual([])
    expect(cleared?.media?.roles).toEqual({})
    expect(cleared?.media?.revision).toBeGreaterThan(0)
  })
})
