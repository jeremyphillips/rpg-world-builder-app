import { describe, expect, it } from 'vitest'

import { ACTION_VALIDATE_BATCH_TARGET_LIMIT } from '@rpg/contracts'

import { createHomebrewContent } from './content-write.service'
import { featWriteConfig } from '../feats/feats.config'
import {
  batchGetContentCampaignAccessAvailability,
  getContentCampaignAccessAvailability,
} from './content-campaign-access.service'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'

useIntegrationDb()

const minimalFeatInput = {
  slug: 'batch-parity-feat',
  name: 'Batch Parity Feat',
  category: 'origin' as const,
  repeatable: { allowed: false },
}

describe('content campaign access batch parity', () => {
  it('matches parallel single-target availability for the same unique IDs', async () => {
    const campaign = await makeTestCampaign()
    const created = await createHomebrewContent(featWriteConfig, campaign.id, {
      ...minimalFeatInput,
      slug: 'batch-parity-a',
      name: 'Batch Parity A',
    })
    const createdSecond = await createHomebrewContent(featWriteConfig, campaign.id, {
      ...minimalFeatInput,
      slug: 'batch-parity-b',
      name: 'Batch Parity B',
    })

    const entityIds = [created.id, createdSecond.id]

    const batch = await batchGetContentCampaignAccessAvailability(
      featWriteConfig,
      campaign.id,
      entityIds,
    )
    const singles = await Promise.all(
      entityIds.map((entityId) =>
        getContentCampaignAccessAvailability(featWriteConfig, campaign.id, entityId),
      ),
    )

    expect(batch.targets).toHaveLength(entityIds.length)
    expect(batch.targets.map((target) => target.targetId)).toEqual(entityIds)

    for (let index = 0; index < entityIds.length; index += 1) {
      const batchTarget = batch.targets[index]
      expect(batchTarget).toMatchObject({
        targetId: entityIds[index],
        availability: singles[index],
      })
    }
  })

  it('rejects batch requests above the target limit at the contract layer', () => {
    expect(ACTION_VALIDATE_BATCH_TARGET_LIMIT).toBe(50)
  })
})
