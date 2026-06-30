import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db'
import { createCampaign } from '../../campaign'
import { createUser } from '../../user'
import { resolveSubclassesForCampaign } from './list-subclasses'

beforeAll(async () => {
  await startTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

async function makeCampaign() {
  const owner = await createUser({
    email: 'owner@example.com',
    passwordHash: 'x',
    displayName: 'Owner',
  })
  return createCampaign({ name: 'Test', createdBy: owner.id })
}

describe('resolveSubclassesForCampaign', () => {
  it('returns catalog subclasses for a system class id', async () => {
    const campaign = await makeCampaign()

    const subclasses = await resolveSubclassesForCampaign(campaign.id, 'srd-cc-5.2.1:fighter')

    expect(subclasses.length).toBeGreaterThan(0)
    expect(subclasses.every((sub) => sub.classId === 'srd-cc-5.2.1:fighter')).toBe(true)
  })

  it('throws when the campaign does not exist', async () => {
    await expect(
      resolveSubclassesForCampaign('000000000000000000000000', 'srd-cc-5.2.1:fighter'),
    ).rejects.toMatchObject({ status: 404 })
  })
})
