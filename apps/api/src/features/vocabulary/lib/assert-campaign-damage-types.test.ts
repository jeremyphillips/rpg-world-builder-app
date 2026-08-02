import { describe, expect, it } from 'vitest'

import { DAMAGE_TYPE_SET_ID, SENSE_SET_ID } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  assertDamageTypesActiveInCampaign,
  assertSensesActiveInCampaign,
  getActiveDamageTypeIdsForCampaign,
  getActiveSenseIdsForCampaign,
} from './assert-campaign-damage-types'
import {
  updateVocabularyEntry,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'

useIntegrationDb()

describe('assertDamageTypesActiveInCampaign', () => {
  it('accepts active seed damage types', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Vocab' })

    const activeIds = await getActiveDamageTypeIdsForCampaign(campaignId)
    expect(activeIds.has('fire')).toBe(true)

    await expect(
      assertDamageTypesActiveInCampaign(campaignId, ['fire', 'cold']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled damage types', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Disabled' })

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaignId),
      DAMAGE_TYPE_SET_ID,
      'fire',
      {
        status: 'disabled',
      },
    )

    await expect(assertDamageTypesActiveInCampaign(campaignId, ['fire'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})

describe('assertSensesActiveInCampaign', () => {
  it('accepts active seed senses', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Vocab' })

    const activeIds = await getActiveSenseIdsForCampaign(campaignId)
    expect(activeIds.has('darkvision')).toBe(true)

    await expect(assertSensesActiveInCampaign(campaignId, ['darkvision'])).resolves.toBeUndefined()
  })

  it('rejects disabled senses', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Disabled' })

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaignId),
      SENSE_SET_ID,
      'darkvision',
      {
        status: 'disabled',
      },
    )

    await expect(assertSensesActiveInCampaign(campaignId, ['darkvision'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
