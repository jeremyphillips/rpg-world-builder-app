import { afterEach, describe, expect, it, vi } from 'vitest'

import { CampaignInviteModel } from './campaign-invite.model'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { CharacterModel } from '../character/character.model'
import { createPcRecord } from '../character/character.repository'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import {
  createFakeEmailProvider,
  getFakeEmailSentMessages,
  resetFakeEmailSentMessages,
} from '../../services/email/providers/fake-email.provider'
import { setEmailProviderForTests } from '../../services/email/email.service'
import {
  acceptCampaignInvite,
  completeCampaignInviteWithExistingCharacter,
  completeCampaignInviteWithNewCharacter,
  getCampaignInviteOnboardingContext,
  listCampaignInvitesForOverview,
  listEligibleCharactersForInvite,
  resolveCampaignInviteByToken,
  sendCampaignInvite,
} from './campaign-invite.service'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import { computeInviteExpiresAt } from './campaign-invite.lib'
import { createInviteRecord } from './campaign-invite.repository'
import * as inviteRepository from './campaign-invite.repository'

useIntegrationDb()

function extractInviteTokenFromEmail(text: string): string {
  const match = text.match(/\/campaign-invites\/([0-9a-f]{64})/)
  if (!match?.[1]) {
    throw new Error('Invite token not found in email body.')
  }
  return match[1]
}

afterEach(() => {
  setEmailProviderForTests(undefined)
  resetFakeEmailSentMessages()
})

describe('campaign invite service', () => {
  it('creates and delivers a pending invite', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const { id: campaignId, owner } = await makeTestCampaign()

    const result = await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    expect(result.invite).toMatchObject({
      email: 'player@example.com',
      status: 'pending',
      deliveryStatus: 'sent',
    })
  })

  it('rejects inviting a fully onboarded member', async () => {
    const provider = createFakeEmailProvider()
    const player = await makeTestUser({ email: 'player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign()

    await CampaignMembershipModel.create({
      campaignId,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: ['char-1'],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    await expect(
      sendCampaignInvite({
        campaignId,
        email: 'player@example.com',
        invitedByUserId: owner.id,
        provider,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'already_member' })
  })

  it('allows a replacement invite for an incomplete member after expiry', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const player = await makeTestUser({ email: 'player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign()

    await CampaignMembershipModel.create({
      campaignId,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const expiredInvite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: new Date(Date.now() - 60_000),
      invitedByUserId: owner.id,
    })
    await CampaignInviteModel.findByIdAndUpdate(expiredInvite.id, {
      status: 'expired',
      acceptedByUserId: player.id,
      acceptedAt: new Date(Date.now() - 120_000),
    })

    const result = await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    expect(result.invite.status).toBe('pending')
  })

  it('rejects resend while an active accepted invite exists', async () => {
    const provider = createFakeEmailProvider()
    const player = await makeTestUser({ email: 'player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign()

    await CampaignMembershipModel.create({
      campaignId,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })
    const activeAccepted = await CampaignInviteModel.findOneAndUpdate(
      { campaignId, normalizedEmail: 'player@example.com' },
      {
        status: 'accepted',
        acceptedByUserId: player.id,
        acceptedAt: new Date(),
      },
      { new: true },
    )

    expect(activeAccepted).not.toBeNull()

    await expect(
      sendCampaignInvite({
        campaignId,
        email: 'player@example.com',
        invitedByUserId: owner.id,
        provider,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'invite_already_accepted' })
  })

  it('rotates pending invites and enforces cooldown', async () => {
    const provider = createFakeEmailProvider()
    const { id: campaignId, owner } = await makeTestCampaign()

    const first = await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    await expect(
      sendCampaignInvite({
        campaignId,
        email: 'player@example.com',
        invitedByUserId: owner.id,
        provider,
      }),
    ).rejects.toMatchObject({ status: 429, code: 'cooldown' })

    await CampaignInviteModel.findByIdAndUpdate(
      first.invite.id,
      { $set: { updatedAt: new Date(Date.now() - 61_000) } },
      { timestamps: false },
    )

    const second = await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    expect(second.invite.id).toBe(first.invite.id)
    expect(second.invite.deliveryStatus).toBe('sent')
  })

  it('invalidates the previous token when a pending invite is rotated', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const { id: campaignId, owner } = await makeTestCampaign()

    await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })
    const firstToken = extractInviteTokenFromEmail(getFakeEmailSentMessages()[0]?.text ?? '')

    const invite = await CampaignInviteModel.findOne({
      campaignId,
      normalizedEmail: 'player@example.com',
    })
    await CampaignInviteModel.findByIdAndUpdate(
      invite?.id,
      { $set: { updatedAt: new Date(Date.now() - 61_000) } },
      { timestamps: false },
    )

    resetFakeEmailSentMessages()
    await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })
    const secondToken = extractInviteTokenFromEmail(getFakeEmailSentMessages()[0]?.text ?? '')

    expect(firstToken).not.toBe(secondToken)
    await expect(resolveCampaignInviteByToken(firstToken)).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    })
    await expect(resolveCampaignInviteByToken(secondToken)).resolves.toMatchObject({
      status: 'pending',
    })
  })

  it('resolves, accepts, and loads onboarding context', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Onboarding Campaign' })
    const player = await makeTestUser({ email: 'player@example.com', displayName: 'Player One' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })
    await CampaignInviteModel.findByIdAndUpdate(invite.id, {
      deliveryStatus: 'sent',
    })

    const resolution = await resolveCampaignInviteByToken(rawToken)
    expect(resolution).toMatchObject({
      campaignName: 'Onboarding Campaign',
      status: 'pending',
      invitedEmail: 'player@example.com',
      invitedEmailMasked: 'p***@example.com',
    })

    const accepted = await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })
    expect(accepted).toMatchObject({ inviteId: invite.id, campaignId })

    const membership = await CampaignMembershipModel.findOne({ campaignId, userId: player.id })
    expect(membership).toMatchObject({
      campaignRole: 'pc',
      controlledCharacterIds: [],
    })
    expect(membership?.joinedAt).toBeInstanceOf(Date)

    const context = await getCampaignInviteOnboardingContext({
      inviteId: invite.id,
      userId: player.id,
    })
    expect(context).toMatchObject({
      status: 'accepted',
      inviteId: invite.id,
      campaign: { id: campaignId, name: 'Onboarding Campaign' },
      membership: { role: 'pc' },
      startingLevel: 1,
    })
  })

  it('rejects acceptance when the signed-in email does not match', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const rawToken = generateInviteToken()
    await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await expect(
      acceptCampaignInvite({
        rawToken,
        userId: owner.id,
        userEmail: owner.email,
      }),
    ).rejects.toMatchObject({ status: 403, code: 'email_mismatch' })
  })

  it('expires invites lazily on resolve', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const rawToken = generateInviteToken()
    await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: new Date(Date.now() - 60_000),
      invitedByUserId: owner.id,
    })

    const resolution = await resolveCampaignInviteByToken(rawToken)
    expect(resolution.status).toBe('expired')
  })

  it('lists pending invites for campaign overview', async () => {
    const provider = createFakeEmailProvider()
    const { id: campaignId, owner } = await makeTestCampaign()

    await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    const invites = await listCampaignInvitesForOverview(campaignId)
    expect(invites).toHaveLength(1)
    expect(invites[0]).toMatchObject({
      email: 'player@example.com',
      status: 'pending',
    })
  })

  it('lists eligible characters and completes onboarding with an existing PC', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Completion Campaign' })
    const player = await makeTestUser({ email: 'player@example.com', displayName: 'Player One' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
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

    const eligible = await listEligibleCharactersForInvite({
      inviteId: invite.id,
      userId: player.id,
    })

    expect(eligible).toHaveLength(1)
    expect(eligible[0]).toMatchObject({
      characterId: character.id,
      name: character.name,
      eligibility: { eligible: true, blockingIssues: [], warnings: [] },
    })

    const completed = await completeCampaignInviteWithExistingCharacter({
      inviteId: invite.id,
      userId: player.id,
      characterId: character.id,
    })

    expect(completed).toEqual({ campaignId, characterId: character.id })

    const membership = await CampaignMembershipModel.findOne({ campaignId, userId: player.id })
    expect(membership?.controlledCharacterIds).toContain(character.id)

    const refreshedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(refreshedInvite).toMatchObject({
      status: 'completed',
      completedCharacterId: character.id,
    })

    const onboardingContext = await getCampaignInviteOnboardingContext({
      inviteId: invite.id,
      userId: player.id,
    })
    expect(onboardingContext).toMatchObject({
      status: 'completed',
      campaignId,
      characterId: character.id,
    })

    const idempotent = await completeCampaignInviteWithExistingCharacter({
      inviteId: invite.id,
      userId: player.id,
      characterId: character.id,
    })
    expect(idempotent).toEqual({ campaignId, characterId: character.id })
  })

  it('completes onboarding by creating a new campaign PC', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'New PC Campaign' })
    const player = await makeTestUser({ email: 'newpc@example.com', displayName: 'New PC Player' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'newpc@example.com',
      normalizedEmail: 'newpc@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const completed = await completeCampaignInviteWithNewCharacter({
      inviteId: invite.id,
      userId: player.id,
      characterCreateInput: minimalStandalonePcInput,
    })

    expect(completed.campaignId).toBe(campaignId)
    expect(completed.characterId).toBeTruthy()

    const membership = await CampaignMembershipModel.findOne({ campaignId, userId: player.id })
    expect(membership?.controlledCharacterIds).toContain(completed.characterId)

    const refreshedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(refreshedInvite).toMatchObject({
      status: 'completed',
      completedCharacterId: completed.characterId,
    })

    const idempotent = await completeCampaignInviteWithNewCharacter({
      inviteId: invite.id,
      userId: player.id,
      characterCreateInput: minimalStandalonePcInput,
    })
    expect(idempotent).toEqual(completed)
  })

  it('rejects onboarding context for pending invites and wrong users', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'player@example.com' })
    const otherUser = await makeTestUser({ email: 'other@example.com' })
    const rawToken = generateInviteToken()

    const pendingInvite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await expect(
      getCampaignInviteOnboardingContext({ inviteId: pendingInvite.id, userId: player.id }),
    ).rejects.toMatchObject({ status: 409, code: 'conflict' })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    await expect(
      getCampaignInviteOnboardingContext({ inviteId: pendingInvite.id, userId: otherUser.id }),
    ).rejects.toMatchObject({ status: 403, code: 'forbidden' })
  })

  it('rejects onboarding context for expired accepted invites', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'expired-player@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'expired-player@example.com',
      normalizedEmail: 'expired-player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    await CampaignInviteModel.findByIdAndUpdate(invite.id, {
      expiresAt: new Date(Date.now() - 60_000),
    })

    await expect(
      getCampaignInviteOnboardingContext({ inviteId: invite.id, userId: player.id }),
    ).rejects.toMatchObject({ status: 409, code: 'conflict' })
  })

  it('rejects completion when the character has blocking eligibility issues', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({
      characterCreation: { startingLevel: 1 },
    })
    const player = await makeTestUser({ email: 'blocked@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'blocked@example.com',
      normalizedEmail: 'blocked@example.com',
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
      completeCampaignInviteWithExistingCharacter({
        inviteId: invite.id,
        userId: player.id,
        characterId: character.id,
      }),
    ).rejects.toMatchObject({ status: 422, code: 'ineligible_character' })
  })

  it('rejects completion with a different character after onboarding is complete', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'conflict@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'conflict@example.com',
      normalizedEmail: 'conflict@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const firstCharacter = await createPcRecord(minimalStandalonePcInput, player.id)
    const secondCharacter = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Second PC' },
      player.id,
    )

    await completeCampaignInviteWithExistingCharacter({
      inviteId: invite.id,
      userId: player.id,
      characterId: firstCharacter.id,
    })

    await expect(
      completeCampaignInviteWithExistingCharacter({
        inviteId: invite.id,
        userId: player.id,
        characterId: secondCharacter.id,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'conflict' })
  })

  it('compensates new-character completion when invite completion fails', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'compensate@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'compensate@example.com',
      normalizedEmail: 'compensate@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    const markCompletedSpy = vi
      .spyOn(inviteRepository, 'markInviteCompleted')
      .mockResolvedValueOnce(null)

    await expect(
      completeCampaignInviteWithNewCharacter({
        inviteId: invite.id,
        userId: player.id,
        characterCreateInput: minimalStandalonePcInput,
      }),
    ).rejects.toMatchObject({ status: 500, code: 'internal_error' })

    markCompletedSpy.mockRestore()

    const remainingCharacters = await CharacterModel.find({ userId: player.id }).lean()
    expect(remainingCharacters).toHaveLength(0)

    const membership = await CampaignMembershipModel.findOne({ campaignId, userId: player.id })
    expect(membership?.controlledCharacterIds ?? []).toEqual([])

    const refreshedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(refreshedInvite?.status).toBe('accepted')
    expect(refreshedInvite?.completedCharacterId).toBeNull()
  })
})
