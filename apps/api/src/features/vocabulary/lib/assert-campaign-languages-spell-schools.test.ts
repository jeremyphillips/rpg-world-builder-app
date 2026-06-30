import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { LANGUAGE_SET_ID, SPELL_SCHOOL_SET_ID } from '@rpg/contracts'

import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db'
import { createCampaign } from '../../campaign'
import { createUser } from '../../user'
import {
  assertLanguagesActiveInCampaign,
  assertSpellSchoolsActiveInCampaign,
  getActiveLanguageIdsForCampaign,
  getActiveSpellSchoolIdsForCampaign,
} from './assert-campaign-languages-spell-schools'
import { updateVocabularyEntry } from '../sets/vocabulary.service'

beforeAll(async () => {
  await startTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

describe('assertLanguagesActiveInCampaign', () => {
  it('accepts active seed languages', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Vocab', createdBy: owner.id })

    const activeIds = await getActiveLanguageIdsForCampaign(campaign.id)
    expect(activeIds.has('common')).toBe(true)

    await expect(
      assertLanguagesActiveInCampaign(campaign.id, ['common', 'elvish']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled languages', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Disabled', createdBy: owner.id })

    await updateVocabularyEntry(campaign.id, LANGUAGE_SET_ID, 'common', {
      status: 'disabled',
    })

    await expect(assertLanguagesActiveInCampaign(campaign.id, ['common'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})

describe('assertSpellSchoolsActiveInCampaign', () => {
  it('accepts active seed spell schools', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Vocab', createdBy: owner.id })

    const activeIds = await getActiveSpellSchoolIdsForCampaign(campaign.id)
    expect(activeIds.has('evocation')).toBe(true)

    await expect(
      assertSpellSchoolsActiveInCampaign(campaign.id, ['evocation']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled spell schools', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Disabled', createdBy: owner.id })

    await updateVocabularyEntry(campaign.id, SPELL_SCHOOL_SET_ID, 'evocation', {
      status: 'disabled',
    })

    await expect(
      assertSpellSchoolsActiveInCampaign(campaign.id, ['evocation']),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
