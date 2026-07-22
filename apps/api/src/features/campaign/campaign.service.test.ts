import { describe, expect, it } from 'vitest'

import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { CampaignMembershipModel } from './campaign-membership.model'
import {
  createCampaign,
  isCampaignMember,
  listCampaignTemplates,
  listCampaignsForUser,
  updateCampaign,
} from './campaign.service'
import { getRulesetPatchRead } from '../vocabulary'

useIntegrationDb()

describe('createCampaign', () => {
  it('persists flavor on the campaign and character creation on the ruleset patch', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })

    const campaign = await createCampaign({
      name: 'Flavored',
      createdBy: owner.id,
      characterCreation: {
        startingLevel: 3,
        importedCharacters: { policy: 'approval_required' },
      },
      flavor: {
        playStyle: ['mystery', 'sandbox'],
        mood: ['gritty'],
        magicLevel: 'low_magic',
        difficulty: 'dangerous',
      },
    })

    expect(campaign.configuration).toMatchObject({
      flavor: {
        playStyle: ['mystery', 'sandbox'],
        mood: ['gritty'],
        magicLevel: 'low_magic',
        difficulty: 'dangerous',
      },
    })

    const patch = await getRulesetPatchRead(campaign.id)
    expect(patch?.characterCreation).toMatchObject({
      startingLevel: 3,
      importedCharacters: { policy: 'approval_required' },
    })
  })

  it('materializes a selected campaign template before persistence', async () => {
    const owner = await makeTestUser({ email: 'template-owner@example.com' })

    const campaign = await createCampaign({
      name: 'The Argent Road',
      createdBy: owner.id,
      campaignTemplateId: 'classic-adventure',
      flavor: { mood: ['gritty'] },
    })

    expect(campaign).toMatchObject({
      identity: { name: 'The Argent Road' },
      rulesetId: 'srd-cc-5.2.1',
      presetProvenance: {
        campaignTemplate: { id: 'classic-adventure', version: '1.0.0' },
        worldSeedPacks: [],
      },
      configuration: {
        flavor: {
          playStyle: ['exploration', 'roleplay_driven'],
          mood: ['gritty'],
          magicLevel: 'standard_fantasy',
          difficulty: 'dangerous',
        },
      },
    })
  })

  it('does not attach preset provenance to a blank campaign', async () => {
    const owner = await makeTestUser({ email: 'blank-owner@example.com' })
    const campaign = await createCampaign({ name: 'Blank', createdBy: owner.id })

    expect(campaign).not.toHaveProperty('presetProvenance')
  })

  it('rejects an unknown campaign template before persistence', async () => {
    await expect(
      createCampaign({
        name: 'Unknown Template',
        createdBy: 'user-id',
        campaignTemplateId: 'missing',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'bad_request' })
  })
})

describe('listCampaignTemplates', () => {
  it('returns the validated shipped template descriptors and defaults', () => {
    expect(listCampaignTemplates()).toMatchObject([
      {
        metadata: { id: 'classic-adventure', version: '1.0.0' },
        rulesetId: 'srd-cc-5.2.1',
      },
    ])
  })
})

describe('listCampaignsForUser', () => {
  it('returns every campaign the user owns or belongs to, sorted by name', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })

    const zelda = await createCampaign({ name: 'Zelda', createdBy: owner.id })
    const arden = await createCampaign({ name: 'Arden', createdBy: owner.id })

    const campaigns = await listCampaignsForUser(owner.id)

    expect(campaigns.map((c) => c.id)).toEqual([arden.id, zelda.id])
    expect(campaigns.map((c) => c.identity.name)).toEqual(['Arden', 'Zelda'])
    expect(campaigns.every((c) => c.campaignRole === 'owner')).toBe(true)
  })

  it('includes campaigns the user joined but did not create', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const member = await makeTestUser({ email: 'member@example.com' })
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
    expect(campaigns[0]?.campaignRole).toBe('pc')
  })

  it('returns co-owner role for co-owner memberships', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const coOwner = await makeTestUser({ email: 'co@example.com' })
    const campaign = await createCampaign({ name: 'Shared', createdBy: owner.id })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: coOwner.id,
      campaignRole: 'co-owner',
      characterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const campaigns = await listCampaignsForUser(coOwner.id)
    expect(campaigns.map((c) => c.id)).toEqual([campaign.id])
    expect(campaigns[0]?.campaignRole).toBe('co-owner')
  })

  it('excludes campaigns the user has no membership in', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const stranger = await makeTestUser({ email: 'stranger@example.com' })
    await createCampaign({ name: 'Private', createdBy: owner.id })

    await expect(listCampaignsForUser(stranger.id)).resolves.toEqual([])
  })
})

describe('updateCampaign', () => {
  it('merges identity and flavor into the existing document', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const campaign = await createCampaign({ name: 'Original', createdBy: owner.id })

    const updated = await updateCampaign(campaign.id, {
      name: 'Renamed',
      description: 'New blurb',
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
    const owner = await makeTestUser({ email: 'owner@example.com' })
    await expect(updateCampaign('507f1f77bcf86cd799439011', { name: 'Nope' })).resolves.toBeNull()
    void owner
  })
})

describe('isCampaignMember', () => {
  it('is true for a member and false for a non-member', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const stranger = await makeTestUser({ email: 'stranger@example.com' })
    const campaign = await createCampaign({ name: 'Campaign', createdBy: owner.id })

    await expect(isCampaignMember(owner.id, campaign.id)).resolves.toBe(true)
    await expect(isCampaignMember(stranger.id, campaign.id)).resolves.toBe(false)
  })

  it('is false for an invalid campaign id', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    await expect(isCampaignMember(owner.id, 'not-an-object-id')).resolves.toBe(false)
  })
})
