import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { createUser } from '../user'
import { CampaignMembershipModel } from './campaign-membership.model'
import {
  createCampaign,
  isCampaignMember,
  listCampaignsForUser,
  updateCampaign,
} from './campaign.service'

beforeAll(async () => {
  await startTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

async function makeUser(email: string) {
  return createUser({ email, passwordHash: 'x', displayName: email })
}

describe('listCampaignsForUser', () => {
  it('returns every campaign the user owns or belongs to, sorted by name', async () => {
    const owner = await makeUser('owner@example.com')

    const zelda = await createCampaign({ name: 'Zelda', createdBy: owner.id })
    const arden = await createCampaign({ name: 'Arden', createdBy: owner.id })

    const campaigns = await listCampaignsForUser(owner.id)

    expect(campaigns.map((c) => c.id)).toEqual([arden.id, zelda.id])
    expect(campaigns.map((c) => c.identity.name)).toEqual(['Arden', 'Zelda'])
  })

  it('includes campaigns the user joined but did not create', async () => {
    const owner = await makeUser('owner@example.com')
    const member = await makeUser('member@example.com')
    const campaign = await createCampaign({ name: 'Shared', createdBy: owner.id })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: member.id,
      campaignRole: 'pc',
      characterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const campaigns = await listCampaignsForUser(member.id)
    expect(campaigns.map((c) => c.id)).toEqual([campaign.id])
  })

  it('excludes campaigns the user has no membership in', async () => {
    const owner = await makeUser('owner@example.com')
    const stranger = await makeUser('stranger@example.com')
    await createCampaign({ name: 'Private', createdBy: owner.id })

    await expect(listCampaignsForUser(stranger.id)).resolves.toEqual([])
  })
})

describe('updateCampaign', () => {
  it('merges identity, settings, and flavor into the existing document', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Original', createdBy: owner.id })

    const updated = await updateCampaign(campaign.id, {
      name: 'Renamed',
      description: 'New blurb',
      settings: {
        characterCreation: {
          startingLevel: 5,
          importedCharacters: { policy: 'approval_required' },
        },
      },
      flavor: {
        playStyle: ['sandbox'],
        mood: ['heroic'],
        magicLevel: 'high_magic',
        difficulty: 'brutal',
      },
    })

    expect(updated).toMatchObject({
      identity: { name: 'Renamed', description: 'New blurb' },
      configuration: {
        settings: {
          characterCreation: {
            startingLevel: 5,
            importedCharacters: { policy: 'approval_required' },
          },
        },
        flavor: {
          playStyle: ['sandbox'],
          mood: ['heroic'],
          magicLevel: 'high_magic',
          difficulty: 'brutal',
        },
      },
    })
  })

  it('returns null for an unknown campaign id', async () => {
    const owner = await makeUser('owner@example.com')
    await expect(updateCampaign('507f1f77bcf86cd799439011', { name: 'Nope' })).resolves.toBeNull()
    void owner
  })
})

describe('isCampaignMember', () => {
  it('is true for a member and false for a non-member', async () => {
    const owner = await makeUser('owner@example.com')
    const stranger = await makeUser('stranger@example.com')
    const campaign = await createCampaign({ name: 'Campaign', createdBy: owner.id })

    await expect(isCampaignMember(owner.id, campaign.id)).resolves.toBe(true)
    await expect(isCampaignMember(stranger.id, campaign.id)).resolves.toBe(false)
  })

  it('is false for an invalid campaign id', async () => {
    const owner = await makeUser('owner@example.com')
    await expect(isCampaignMember(owner.id, 'not-an-object-id')).resolves.toBe(false)
  })
})
