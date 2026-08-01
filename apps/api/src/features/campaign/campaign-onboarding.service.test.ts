import { afterEach, describe, expect, it, vi } from 'vitest'

import * as mongoTransaction from '../../lib/mongo-transaction'
import {
  acceptCampaignInvite,
  CampaignInviteModel,
  computeInviteExpiresAt,
  createInviteRecord,
  generateInviteToken,
  hashInviteToken,
} from '../campaign-invite'
import { CharacterModel, createPcRecord } from '../character'
import { CampaignMembershipModel } from './campaign-membership.model'
import { CampaignCharacterParticipationModel } from './participation/campaign-character-participation.model'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import * as assignControlledPc from './participation/assign-controlled-pc.service'
import * as onboardingObservability from './campaign-onboarding-observability.lib'
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
  it('stores sourceInviteId on membership when an invite is accepted', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'source-invite@example.com' })
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

    const membership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    expect(membership?.sourceInviteId).toBe(invite.id)
  })

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
      mode: 'initial',
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

  it('allows completion when the linked invite is expired and emits invite audit observability', async () => {
    const auditSpy = vi.spyOn(onboardingObservability, 'warnCampaignOnboardingInviteAuditFailed')

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

    const refreshedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(refreshedInvite?.status).toBe('expired')

    const membership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    expect(membership?.controlledCharacterIds).toEqual([character.id])

    expect(auditSpy).toHaveBeenCalledWith({
      campaignId,
      linkedInviteId: invite.id,
      characterId: character.id,
    })
  })

  it('completes onboarding by creating a new campaign PC', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Onboarding New PC Campaign' })
    const player = await makeTestUser({ email: 'onboarding-newpc@example.com' })
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

    const result = await completeCampaignOnboardingForUser({
      campaignId,
      userId: player.id,
      userEmail: player.email,
      source: 'new',
      character: minimalStandalonePcInput,
    })

    expect(result.campaignId).toBe(campaignId)
    expect(result.characterId).toBeTruthy()

    const membership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    expect(membership?.controlledCharacterIds).toContain(result.characterId)

    const refreshedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(refreshedInvite).toMatchObject({
      status: 'completed',
      completedCharacterId: result.characterId,
    })
  })

  it('returns idempotently when onboarding is retried with the same character', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'onboarding-idempotent@example.com' })
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

    const completed = await completeCampaignOnboardingForUser({
      campaignId,
      userId: player.id,
      userEmail: player.email,
      source: 'existing',
      characterId: character.id,
    })

    const idempotent = await completeCampaignOnboardingForUser({
      campaignId,
      userId: player.id,
      userEmail: player.email,
      source: 'existing',
      characterId: character.id,
    })

    expect(idempotent).toEqual(completed)
  })

  it('rejects completion when the character has blocking eligibility issues', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({
      characterCreation: { startingLevel: 1 },
    })
    const player = await makeTestUser({ email: 'onboarding-blocked@example.com' })
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

    const character = await createPcRecord(
      {
        ...minimalStandalonePcInput,
        classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 3 }],
      },
      player.id,
    )

    await expect(
      completeCampaignOnboardingForUser({
        campaignId,
        userId: player.id,
        userEmail: player.email,
        source: 'existing',
        characterId: character.id,
      }),
    ).rejects.toMatchObject({
      failure: {
        kind: 'campaign_ineligible',
        blockingIssues: expect.arrayContaining([
          expect.objectContaining({ code: 'level_mismatch' }),
        ]),
      },
    })
  })

  it('prefers the membership-linked invite when multiple accepted invites exist', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'onboarding-multi-invite@example.com' })

    const olderInvite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })
    const newerInvite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: `${player.email}.recovery`,
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    const olderAcceptedAt = new Date('2026-01-01T00:00:00.000Z')
    const newerAcceptedAt = new Date('2026-02-01T00:00:00.000Z')

    await CampaignInviteModel.findByIdAndUpdate(olderInvite.id, {
      status: 'accepted',
      acceptedByUserId: player.id,
      acceptedAt: olderAcceptedAt,
      normalizedEmail: player.email,
    })
    await CampaignInviteModel.findByIdAndUpdate(newerInvite.id, {
      status: 'accepted',
      acceptedByUserId: player.id,
      acceptedAt: newerAcceptedAt,
      normalizedEmail: `${player.email}.recovery`,
    })

    await CampaignMembershipModel.create({
      campaignId,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: olderAcceptedAt,
      joinedAt: olderAcceptedAt,
      sourceInviteId: olderInvite.id,
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

    const refreshedOlderInvite = await CampaignInviteModel.findById(olderInvite.id).lean()
    const refreshedNewerInvite = await CampaignInviteModel.findById(newerInvite.id).lean()
    expect(refreshedOlderInvite?.status).toBe('completed')
    expect(refreshedNewerInvite?.status).toBe('accepted')
  })

  it('falls back to the newest accepted invite when membership has no sourceInviteId', async () => {
    const duplicateSpy = vi.spyOn(
      onboardingObservability,
      'warnCampaignOnboardingDuplicateAcceptedInvites',
    )

    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'onboarding-fallback-invite@example.com' })

    const olderInvite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email,
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })
    const newerInvite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: `${player.email}.recovery`,
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    const olderAcceptedAt = new Date('2026-01-01T00:00:00.000Z')
    const newerAcceptedAt = new Date('2026-02-01T00:00:00.000Z')

    await CampaignInviteModel.findByIdAndUpdate(olderInvite.id, {
      status: 'accepted',
      acceptedByUserId: player.id,
      acceptedAt: olderAcceptedAt,
      normalizedEmail: player.email,
    })
    await CampaignInviteModel.findByIdAndUpdate(newerInvite.id, {
      status: 'accepted',
      acceptedByUserId: player.id,
      acceptedAt: newerAcceptedAt,
      normalizedEmail: `${player.email}.recovery`,
    })

    await CampaignMembershipModel.create({
      campaignId,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: olderAcceptedAt,
      joinedAt: olderAcceptedAt,
    })

    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    await completeCampaignOnboardingForUser({
      campaignId,
      userId: player.id,
      userEmail: player.email,
      source: 'existing',
      characterId: character.id,
    })

    const refreshedOlderInvite = await CampaignInviteModel.findById(olderInvite.id).lean()
    const refreshedNewerInvite = await CampaignInviteModel.findById(newerInvite.id).lean()
    expect(refreshedOlderInvite?.status).toBe('accepted')
    expect(refreshedNewerInvite?.status).toBe('completed')

    expect(duplicateSpy).toHaveBeenCalledWith({
      campaignId,
      userId: player.id,
      selectedInviteId: newerInvite.id,
      acceptedInviteIds: [newerInvite.id, olderInvite.id],
    })
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
