import { describe, expect, it } from 'vitest'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  assertCreatureTypesActiveInCampaign,
  getActiveCreatureTypeIdsForCampaign,
} from './assert-campaign-creature-types'
import {
  updateVocabularyEntry,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'

useIntegrationDb()

describe('assertCreatureTypesActiveInCampaign', () => {
  it('accepts active seed creature types', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Vocab' })

    const activeIds = await getActiveCreatureTypeIdsForCampaign(campaignId)
    expect(activeIds.has('humanoid')).toBe(true)

    await expect(
      assertCreatureTypesActiveInCampaign(campaignId, ['humanoid', 'fey']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled creature types', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Disabled' })

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaignId),
      CREATURE_TYPE_SET_ID,
      'fey',
      {
        status: 'disabled',
      },
    )

    await expect(assertCreatureTypesActiveInCampaign(campaignId, ['fey'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
