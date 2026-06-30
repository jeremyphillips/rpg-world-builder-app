import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db'
import { createCampaign } from '../../campaign'
import { createUser } from '../../user'
import {
  assertCreatureTypesActiveInCampaign,
  getActiveCreatureTypeIdsForCampaign,
} from './assert-campaign-creature-types'
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

describe('assertCreatureTypesActiveInCampaign', () => {
  it('accepts active seed creature types', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Vocab', createdBy: owner.id })

    const activeIds = await getActiveCreatureTypeIdsForCampaign(campaign.id)
    expect(activeIds.has('humanoid')).toBe(true)

    await expect(
      assertCreatureTypesActiveInCampaign(campaign.id, ['humanoid', 'fey']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled creature types', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Disabled', createdBy: owner.id })

    await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'fey', {
      status: 'disabled',
    })

    await expect(assertCreatureTypesActiveInCampaign(campaign.id, ['fey'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
