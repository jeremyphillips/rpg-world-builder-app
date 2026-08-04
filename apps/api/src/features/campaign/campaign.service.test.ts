import { describe, expect, it } from 'vitest'

import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import {
  createFakeEmailProvider,
  resetFakeEmailSentMessages,
  setFakeEmailSendResult,
} from '../../services/email/providers/fake-email.provider'
import { setEmailProviderForTests } from '../../services/email/email.service'
import { CampaignMembershipModel } from './campaign-membership.model'
import { createPcRecord } from '../character'
import {
  createCampaign,
  isCampaignMember,
  listCampaignTemplates,
  listCampaignsForUser,
  updateCampaign,
} from './campaign.service'
import { getRulesetPatchRead } from '../vocabulary'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { setMembershipControlledPcs } from '../../test/helpers/campaign-participation'
import { CampaignCharacterParticipationModel } from './participation/campaign-character-participation.model'
import { createHomebrewContent } from '../content'
import { locationWriteConfig } from '../content'
import { HttpError } from '../../lib/http-error'

useIntegrationDb()

describe('createCampaign invite orchestration', () => {
  it('returns an empty invites array when no recipients are provided', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })

    const result = await createCampaign({
      name: 'Solo Campaign',
      createdBy: owner.id,
    })

    expect(result.invites).toEqual([])
  })

  it('sends optional invites after campaign creation without rolling back on delivery failure', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    setEmailProviderForTests(setFakeEmailSendResult({ ok: false, errorCode: 'smtp_failed' }))
    resetFakeEmailSentMessages()

    const result = await createCampaign({
      name: 'Invited Campaign',
      createdBy: owner.id,
      inviteEmails: [{ email: 'player@example.com' }],
    })

    expect(result.campaign.identity.name).toBe('Invited Campaign')
    expect(result.invites).toHaveLength(1)
    expect(result.invites[0]).toMatchObject({
      email: 'player@example.com',
      deliveryStatus: 'failed',
    })

    const membership = await CampaignMembershipModel.findOne({
      campaignId: result.campaign.id,
      userId: owner.id,
    })
    expect(membership?.campaignRole).toBe('owner')
  })

  it('rejects inviting the campaign creator email', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })

    await expect(
      createCampaign({
        name: 'Self Invite Campaign',
        createdBy: owner.id,
        inviteEmails: [{ email: 'owner@example.com' }],
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Cannot invite your own email address.',
    })
  })

  it('dedupes duplicate invite emails during campaign creation', async () => {
    const owner = await makeTestUser({ email: 'dedup-owner@example.com' })
    setEmailProviderForTests(createFakeEmailProvider())
    resetFakeEmailSentMessages()

    const result = await createCampaign({
      name: 'Dedup Campaign',
      createdBy: owner.id,
      inviteEmails: [{ email: 'player@example.com' }, { email: '  player@example.com ' }],
    })

    expect(result.invites).toHaveLength(1)
    expect(result.invites[0]).toMatchObject({
      email: 'player@example.com',
      deliveryStatus: 'sent',
    })
  })
})

describe('createCampaign', () => {
  it('persists flavor on the campaign and character creation on the ruleset patch', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })

    const { campaign } = await createCampaign({
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

    const { campaign } = await createCampaign({
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
    const { campaign } = await createCampaign({ name: 'Blank', createdBy: owner.id })

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

    const { campaign: zelda } = await createCampaign({ name: 'Zelda', createdBy: owner.id })
    const { campaign: arden } = await createCampaign({ name: 'Arden', createdBy: owner.id })

    const campaigns = await listCampaignsForUser(owner.id)

    expect(campaigns.map((c) => c.id)).toEqual([arden.id, zelda.id])
    expect(campaigns.map((c) => c.identity.name)).toEqual(['Arden', 'Zelda'])
    expect(campaigns.every((c) => c.campaignRole === 'owner')).toBe(true)
  })

  it('includes campaigns the user joined but did not create', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const member = await makeTestUser({ email: 'member@example.com' })
    const { campaign } = await createCampaign({ name: 'Shared', createdBy: owner.id })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: member.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
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
    const { campaign } = await createCampaign({ name: 'Shared', createdBy: owner.id })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: coOwner.id,
      campaignRole: 'co-owner',
      controlledCharacterIds: [],
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

  it('returns deduped openControlledCharacterIds intersected with open participation', async () => {
    const owner = await makeTestUser({ email: 'open-control-owner@example.com' })
    const player = await makeTestUser({ email: 'open-control-player@example.com' })
    const { campaign } = await createCampaign({ name: 'Control Campaign', createdBy: owner.id })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    await setMembershipControlledPcs({
      campaignId: campaign.id,
      userId: player.id,
      controlledCharacterIds: [character.id, character.id],
    })

    const campaigns = await listCampaignsForUser(player.id)
    expect(campaigns).toHaveLength(1)
    expect(campaigns[0]?.controlledCharacterIds).toEqual([character.id])
    expect(campaigns[0]?.openControlledCharacterIds).toEqual([character.id])
  })

  it('excludes closed participation from openControlledCharacterIds', async () => {
    const owner = await makeTestUser({ email: 'closed-participation-owner@example.com' })
    const player = await makeTestUser({ email: 'closed-participation-player@example.com' })
    const { campaign } = await createCampaign({
      name: 'Closed Participation Campaign',
      createdBy: owner.id,
    })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    await setMembershipControlledPcs({
      campaignId: campaign.id,
      userId: player.id,
      controlledCharacterIds: [character.id],
    })

    await CampaignCharacterParticipationModel.updateOne(
      { campaignId: campaign.id, characterId: character.id },
      { $set: { leftAt: new Date() } },
    )
    await CampaignMembershipModel.updateOne(
      { campaignId: campaign.id, userId: player.id },
      { $set: { controlledCharacterIds: [character.id] } },
    )

    const campaigns = await listCampaignsForUser(player.id)
    expect(campaigns[0]?.controlledCharacterIds).toEqual([character.id])
    expect(campaigns[0]?.openControlledCharacterIds).toEqual([])
    expect(campaigns[0]?.viewerState).toEqual({
      kind: 'control_stale',
      characterId: character.id,
    })
    expect(campaigns[0]?.recoveryReason).toBe('controlled_character_without_open_participation')
  })

  it('derives viewerState for PC onboarding and active control', async () => {
    const owner = await makeTestUser({ email: 'viewer-onboarding-owner@example.com' })
    const onboardingPlayer = await makeTestUser({ email: 'viewer-onboarding-pc@example.com' })
    const activePlayer = await makeTestUser({ email: 'viewer-active-pc@example.com' })

    const { campaign: onboardingCampaign } = await createCampaign({
      name: 'Onboarding State Campaign',
      createdBy: owner.id,
    })
    const { campaign: activeCampaign } = await createCampaign({
      name: 'Active Control Campaign',
      createdBy: owner.id,
    })

    await CampaignMembershipModel.create({
      campaignId: onboardingCampaign.id,
      userId: onboardingPlayer.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    await CampaignMembershipModel.create({
      campaignId: activeCampaign.id,
      userId: activePlayer.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const character = await createPcRecord(minimalStandalonePcInput, activePlayer.id)
    await setMembershipControlledPcs({
      campaignId: activeCampaign.id,
      userId: activePlayer.id,
      controlledCharacterIds: [character.id],
    })

    const onboardingCampaigns = await listCampaignsForUser(onboardingPlayer.id)
    expect(onboardingCampaigns[0]?.viewerState).toEqual({ kind: 'onboarding_incomplete' })
    expect(onboardingCampaigns[0]?.recoveryReason).toBe('no_controlled_character')

    const activeCampaigns = await listCampaignsForUser(activePlayer.id)
    expect(activeCampaigns[0]?.viewerState).toEqual({ kind: 'ready' })
  })

  it('returns onboarding_incomplete when a fresh invite joins a campaign with existing active PCs', async () => {
    const owner = await makeTestUser({ email: 'populated-owner@example.com' })
    const existingPlayer = await makeTestUser({ email: 'populated-existing@example.com' })
    const freshPlayer = await makeTestUser({ email: 'populated-fresh@example.com' })
    const { campaign } = await createCampaign({ name: 'Populated Campaign', createdBy: owner.id })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: existingPlayer.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const existingCharacter = await createPcRecord(minimalStandalonePcInput, existingPlayer.id)
    await setMembershipControlledPcs({
      campaignId: campaign.id,
      userId: existingPlayer.id,
      controlledCharacterIds: [existingCharacter.id],
    })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: freshPlayer.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const freshCampaigns = await listCampaignsForUser(freshPlayer.id)
    expect(freshCampaigns[0]?.viewerState).toEqual({ kind: 'onboarding_incomplete' })
    expect(freshCampaigns[0]?.recoveryReason).toBe('no_controlled_character')
  })
})

describe('updateCampaign', () => {
  it('merges identity and flavor into the existing document', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const { campaign } = await createCampaign({ name: 'Original', createdBy: owner.id })

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

  it('persists and clears primaryWorldId when settings are patched', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const { campaign } = await createCampaign({ name: 'World Campaign', createdBy: owner.id })
    const world = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'faerun',
      kind: 'world',
      name: 'Faerûn',
    })

    const withWorld = await updateCampaign(campaign.id, {
      settings: { primaryWorldId: world.id },
    })
    expect(withWorld?.configuration.settings?.primaryWorldId).toBe(world.id)

    const cleared = await updateCampaign(campaign.id, {
      settings: { primaryWorldId: null },
    })
    expect(cleared?.configuration.settings?.primaryWorldId).toBeUndefined()
  })

  it('rejects primaryWorldId when the location is not a world', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const { campaign } = await createCampaign({ name: 'Region Campaign', createdBy: owner.id })
    const world = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'parent-world',
      kind: 'world',
      name: 'Parent World',
    })
    const region = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'sword-coast',
      kind: 'region',
      name: 'Sword Coast',
      parentLocationId: world.id,
    })

    await expect(
      updateCampaign(campaign.id, {
        settings: { primaryWorldId: region.id },
      }),
    ).rejects.toBeInstanceOf(HttpError)
  })
})

describe('isCampaignMember', () => {
  it('is true for a member and false for a non-member', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    const stranger = await makeTestUser({ email: 'stranger@example.com' })
    const { campaign } = await createCampaign({ name: 'Campaign', createdBy: owner.id })

    await expect(isCampaignMember(owner.id, campaign.id)).resolves.toBe(true)
    await expect(isCampaignMember(stranger.id, campaign.id)).resolves.toBe(false)
  })

  it('is false for an invalid campaign id', async () => {
    const owner = await makeTestUser({ email: 'owner@example.com' })
    await expect(isCampaignMember(owner.id, 'not-an-object-id')).resolves.toBe(false)
  })
})
