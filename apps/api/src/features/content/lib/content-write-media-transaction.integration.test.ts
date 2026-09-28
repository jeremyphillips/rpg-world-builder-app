import { randomUUID } from 'node:crypto'

import { beforeEach, describe, expect, it } from 'vitest'

import { catalogContentMediaExpectedRevisionField } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { runInTransaction, setMongoTransactionsEnabled } from '../../../lib/mongo-transaction'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createMediaAssetRecord } from '../../media/media.repository'
import { HomebrewSpeciesModel } from '../species/homebrew-species.model'
import { speciesWriteConfig } from '../species/species.config'
import { createHomebrewContent } from './content-write.service'

useIntegrationDb()

const minimalSpeciesInput = {
  slug: 'media-species',
  name: 'Media Species',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [],
}

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

describe('catalog media transaction ownership', () => {
  beforeEach(() => {
    setMongoTransactionsEnabled(true)
  })

  it('honors a caller-owned session and rolls back media create on abort', async () => {
    const campaign = await makeTestCampaign()
    const assetId = await seedCampaignAsset(campaign.id)
    const media = {
      revision: 0,
      images: [{ id: 'img-1', assetId }],
      roles: {},
    }

    await expect(
      runInTransaction(async (session) => {
        await createHomebrewContent(
          speciesWriteConfig,
          campaign.id,
          {
            ...minimalSpeciesInput,
            media,
            [catalogContentMediaExpectedRevisionField]: 0,
          },
          { session },
        )
        throw new Error('abort composition')
      }),
    ).rejects.toThrow('abort composition')

    const records = await HomebrewSpeciesModel.find({ campaignId: campaign.id }).lean()
    expect(records).toHaveLength(0)
  })

  it('commits standalone media create when no caller session is supplied', async () => {
    const campaign = await makeTestCampaign()
    const assetId = await seedCampaignAsset(campaign.id)
    const media = {
      revision: 0,
      images: [{ id: 'img-standalone', assetId }],
      roles: {},
    }

    const created = await createHomebrewContent(speciesWriteConfig, campaign.id, {
      ...minimalSpeciesInput,
      slug: 'standalone-media-species',
      media,
      [catalogContentMediaExpectedRevisionField]: 0,
    })

    expect(created.media?.images).toEqual(media.images)
  })
})
