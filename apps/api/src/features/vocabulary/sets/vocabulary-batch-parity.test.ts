import { describe, expect, it } from 'vitest'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  batchGetVocabularyDisableAvailability,
  createCampaignVocabularyEntry,
  getVocabularyDisableAvailability,
  vocabularyUsageContextForCampaign,
} from './vocabulary.service'

useIntegrationDb()

describe('vocabulary disable batch parity', () => {
  it('matches parallel single-target disable availability for the same unique IDs', async () => {
    const campaign = await makeTestCampaign()
    const ctx = vocabularyUsageContextForCampaign(campaign.id)

    await createCampaignVocabularyEntry(ctx, {
      setId: CREATURE_TYPE_SET_ID,
      id: 'robot',
      label: 'Robot',
    })

    const entryIds = ['humanoid', 'robot']

    const batch = await batchGetVocabularyDisableAvailability(ctx, CREATURE_TYPE_SET_ID, entryIds)
    const singles = await Promise.all(
      entryIds.map((entryId) =>
        getVocabularyDisableAvailability(ctx, CREATURE_TYPE_SET_ID, entryId),
      ),
    )

    expect(batch.targets.map((target) => target.targetId)).toEqual(entryIds)

    for (let index = 0; index < entryIds.length; index += 1) {
      const batchTarget = batch.targets[index]
      expect(batchTarget).toMatchObject({
        targetId: entryIds[index],
        availability: singles[index],
      })
    }
  })
})
