import { afterEach, describe, expect, it } from 'vitest'

import { CampaignInviteModel } from './campaign-invite.model'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { createPcRecord } from '../character/character.repository'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import {
  createFakeEmailProvider,
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

useIntegrationDb()

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
})
