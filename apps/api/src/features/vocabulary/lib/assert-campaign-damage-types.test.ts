import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { DAMAGE_TYPE_SET_ID, SENSE_SET_ID } from '@rpg/contracts'

import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db'
import { createCampaign } from '../../campaign'
import { createUser } from '../../user'
import {
  assertDamageTypesActiveInCampaign,
  assertSensesActiveInCampaign,
  getActiveDamageTypeIdsForCampaign,
  getActiveSenseIdsForCampaign,
} from './assert-campaign-damage-types'
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

describe('assertDamageTypesActiveInCampaign', () => {
  it('accepts active seed damage types', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Vocab', createdBy: owner.id })

    const activeIds = await getActiveDamageTypeIdsForCampaign(campaign.id)
    expect(activeIds.has('fire')).toBe(true)

    await expect(
      assertDamageTypesActiveInCampaign(campaign.id, ['fire', 'cold']),
    ).resolves.toBeUndefined()
  })

  it('rejects disabled damage types', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Disabled', createdBy: owner.id })

    await updateVocabularyEntry(campaign.id, DAMAGE_TYPE_SET_ID, 'fire', {
      status: 'disabled',
    })

    await expect(assertDamageTypesActiveInCampaign(campaign.id, ['fire'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})

describe('assertSensesActiveInCampaign', () => {
  it('accepts active seed senses', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Vocab', createdBy: owner.id })

    const activeIds = await getActiveSenseIdsForCampaign(campaign.id)
    expect(activeIds.has('darkvision')).toBe(true)

    await expect(assertSensesActiveInCampaign(campaign.id, ['darkvision'])).resolves.toBeUndefined()
  })

  it('rejects disabled senses', async () => {
    const owner = await createUser({
      email: 'owner@example.com',
      passwordHash: 'x',
      displayName: 'Owner',
    })
    const campaign = await createCampaign({ name: 'Disabled', createdBy: owner.id })

    await updateVocabularyEntry(campaign.id, SENSE_SET_ID, 'darkvision', {
      status: 'disabled',
    })

    await expect(assertSensesActiveInCampaign(campaign.id, ['darkvision'])).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })
})
