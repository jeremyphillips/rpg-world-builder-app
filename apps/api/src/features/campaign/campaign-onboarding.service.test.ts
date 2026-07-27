import { afterEach, describe, expect, it, vi } from 'vitest'

import * as mongoTransaction from '../../lib/mongo-transaction'
import { CampaignInviteModel } from '../campaign-invite/campaign-invite.model'
import { CampaignMembershipModel } from './campaign-membership.model'
import { CampaignCharacterParticipationModel } from './participation/campaign-character-participation.model'
import { CharacterModel } from '../character/character.model'
import { createPcRecord } from '../character/character.repository'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { acceptCampaignInvite } from '../campaign-invite/campaign-invite.service'
import { generateInviteToken, hashInviteToken } from '../campaign-invite/campaign-invite-token'
import { computeInviteExpiresAt } from '../campaign-invite/campaign-invite.lib'
import { createInviteRecord } from '../campaign-invite/campaign-invite.repository'
import * as assignControlledPc from './participation/assign-controlled-pc.service'
import {
  completeCampaignOnboardingForUser,
  getCampaignOnboardingContext,
  listEligibleCharactersForCampaignOnboarding,
} from './campaign-onboarding.service'

useIntegrationDb()

afterEach(() => {
  vi.restoreAllMocks()
})

describe('campaign onboarding service', () => {
  it('returns incomplete onboarding context for accepted invite membership', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Service Context Campaign' })
    const player = await makeTestUser({ email: 'service-context@example.com' })
    const rawToken = generateInviteToken()

    await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const context = await getCampaignOnboardingContext({
      campaignId,
      userId: player.id,
    })

    expect(context).toMatchObject({
      status: 'onboarding_incomplete',
      campaignId,
      campaign: { id: campaignId, name: 'Service Context Campaign' },
    })
  })

  it('lists eligible characters for incomplete onboarding', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'service-eligible@example.com' })
    const rawToken = generateInviteToken()

    await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const characters = await listEligibleCharactersForCampaignOnboarding({
      campaignId,
      userId: player.id,
    })

    expect(Array.isArray(characters)).toBe(true)
  })

  it('completes onboarding with an existing character and marks linked invite completed', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'service-complete@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    const result = await completeCampaignOnboardingForUser({
      campaignId,
      userId: player.id,
      userEmail: player.email,
      source: 'existing',
      characterId: character.id,
    })

    expect(result).toMatchObject({ campaignId, characterId: character.id })

    const refreshedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(refreshedInvite?.status).toBe('completed')
    expect(refreshedInvite?.completedCharacterId).toBe(character.id)

    const context = await getCampaignOnboardingContext({
      campaignId,
      userId: player.id,
    })
    expect(context).toMatchObject({ status: 'complete', campaignId, characterId: character.id })
  })

  it('allows completion when the linked invite is expired', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'service-expired-invite@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    await CampaignInviteModel.findByIdAndUpdate(invite.id, { status: 'expired' })

    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    const result = await completeCampaignOnboardingForUser({
      campaignId,
      userId: player.id,
      userEmail: player.email,
      source: 'existing',
      characterId: character.id,
    })

    expect(result).toMatchObject({ campaignId, characterId: character.id })
  })

  it('compensates new-character completion when assignment fails', async () => {
    vi.spyOn(mongoTransaction, 'areMongoTransactionsEnabled').mockReturnValue(false)

    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'onboarding-compensate@example.com' })
    const rawToken = generateInviteToken()

    await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const assignSpy = vi
      .spyOn(assignControlledPc, 'assignControlledPcToCampaignMember')
      .mockRejectedValueOnce(new Error('assignment failed'))

    await expect(
      completeCampaignOnboardingForUser({
        campaignId,
        userId: player.id,
        userEmail: player.email,
        source: 'new',
        character: minimalStandalonePcInput,
      }),
    ).rejects.toThrow('assignment failed')

    assignSpy.mockRestore()

    const remainingCharacters = await CharacterModel.find({ userId: player.id }).lean()
    expect(remainingCharacters).toHaveLength(0)

    const membership = await CampaignMembershipModel.findOne({ campaignId, userId: player.id })
    expect(membership?.controlledCharacterIds ?? []).toEqual([])
  })

  it('compensates existing-character completion when assignment fails', async () => {
    vi.spyOn(mongoTransaction, 'areMongoTransactionsEnabled').mockReturnValue(false)

    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'onboarding-existing-compensate@example.com' })
    const rawToken = generateInviteToken()

    await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    const assignSpy = vi
      .spyOn(assignControlledPc, 'assignControlledPcToCampaignMember')
      .mockRejectedValueOnce(new Error('assignment failed'))

    await expect(
      completeCampaignOnboardingForUser({
        campaignId,
        userId: player.id,
        userEmail: player.email,
        source: 'existing',
        characterId: character.id,
      }),
    ).rejects.toThrow('assignment failed')

    assignSpy.mockRestore()

    const remainingCharacters = await CharacterModel.find({ userId: player.id }).lean()
    expect(remainingCharacters).toHaveLength(1)

    const membership = await CampaignMembershipModel.findOne({ campaignId, userId: player.id })
    expect(membership?.controlledCharacterIds ?? []).toEqual([])

    const participation = await CampaignCharacterParticipationModel.findOne({
      campaignId,
      characterId: character.id,
    }).lean()
    expect(participation).toBeNull()
  })
})
