import { describe, expect, it } from 'vitest'

import { LANGUAGE_SET_ID, SPELL_SCHOOL_SET_ID } from '@rpg/contracts'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import {
  assertLanguagesActiveInCampaign,
  assertSpellSchoolsActiveInCampaign,
  getActiveLanguageIdsForCampaign,
  getActiveSpellSchoolIdsForCampaign,
} from './assert-campaign-languages-spell-schools'
import {
  updateVocabularyEntry,
  vocabularyUsageContextForCampaign,
} from '../sets/vocabulary.service'

useIntegrationDb()

describe('assertLanguagesActiveInCampaign', () => {
  it('accepts active seed languages', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Vocab' })

    const activeIds = await getActiveLanguageIdsForCampaign(campaignId)
    expect(activeIds.has('common')).toBe(true)

    await expect(
      assertLanguagesActiveInCampaign(campaignId, ['common', 'elvish']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled languages', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Disabled' })

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaignId),
      LANGUAGE_SET_ID,
      'common',
      {
        status: 'disabled',
      },
    )

    await expect(assertLanguagesActiveInCampaign(campaignId, ['common'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})

describe('assertSpellSchoolsActiveInCampaign', () => {
  it('accepts active seed spell schools', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Vocab' })

    const activeIds = await getActiveSpellSchoolIdsForCampaign(campaignId)
    expect(activeIds.has('evocation')).toBe(true)

    await expect(
      assertSpellSchoolsActiveInCampaign(campaignId, ['evocation']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled spell schools', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'Disabled' })

    await updateVocabularyEntry(
      vocabularyUsageContextForCampaign(campaignId),
      SPELL_SCHOOL_SET_ID,
      'evocation',
      {
        status: 'disabled',
      },
    )

    await expect(
      assertSpellSchoolsActiveInCampaign(campaignId, ['evocation']),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
