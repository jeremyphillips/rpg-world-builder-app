import { describe, expect, it } from 'vitest'
import mongoose from 'mongoose'

import { createCampaign } from '../campaign'
import { createUser } from './user.service'
import { resolveActiveCampaignForUser } from './active-campaign'
import { updateLastSelectedCampaign } from './user.service'
import { useIntegrationDb } from '../../test/setup/integration-db'

useIntegrationDb()

async function makeUser(email: string) {
  return createUser({ email, passwordHash: 'x', displayName: email })
}

describe('resolveActiveCampaignForUser', () => {
  it('returns activeCampaign null when the user has no campaigns', async () => {
    const user = await makeUser('lonely@example.com')

    const session = await resolveActiveCampaignForUser(user.id)

    expect(session).toMatchObject({
      user: { id: user.id, lastSelectedCampaignId: null },
      activeCampaign: null,
    })
  })

  it('resolves the sole campaign when no preference is stored', async () => {
    const owner = await makeUser('owner@example.com')
    const { campaign } = await createCampaign({ name: 'Sunless Citadel', createdBy: owner.id })

    const session = await resolveActiveCampaignForUser(owner.id)

    expect(session?.activeCampaign).toStrictEqual({
      id: campaign.id,
      name: 'Sunless Citadel',
    })
  })

  it('returns the stored preference when it matches a reachable campaign', async () => {
    const owner = await makeUser('owner@example.com')
    const { campaign: first } = await createCampaign({ name: 'Alpha', createdBy: owner.id })
    await createCampaign({ name: 'Beta', createdBy: owner.id })
    await updateLastSelectedCampaign(owner.id, first.id)

    const session = await resolveActiveCampaignForUser(owner.id)

    expect(session?.activeCampaign).toStrictEqual({
      id: first.id,
      name: 'Alpha',
    })
  })

  it('lazy-clears a stale lastSelectedCampaignId and returns activeCampaign null', async () => {
    const owner = await makeUser('owner@example.com')
    await createCampaign({ name: 'Alpha', createdBy: owner.id })
    await createCampaign({ name: 'Beta', createdBy: owner.id })
    const staleId = new mongoose.Types.ObjectId().toString()
    await updateLastSelectedCampaign(owner.id, staleId)

    const session = await resolveActiveCampaignForUser(owner.id)

    expect(session?.activeCampaign).toBeNull()
    expect(session?.user.lastSelectedCampaignId).toBeNull()

    const again = await resolveActiveCampaignForUser(owner.id)
    expect(again?.user.lastSelectedCampaignId).toBeNull()
  })

  it('returns null when the user id is unknown', async () => {
    const staleUserId = new mongoose.Types.ObjectId().toString()
    await expect(resolveActiveCampaignForUser(staleUserId)).resolves.toBeNull()
  })
})
