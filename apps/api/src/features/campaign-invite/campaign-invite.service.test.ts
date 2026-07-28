import { afterEach, describe, expect, it, vi } from 'vitest'

import { CampaignInviteModel } from './campaign-invite.model'
import { CampaignMembershipModel } from '../campaign'
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
  listCampaignInvitesForOverview,
  resolveCampaignInviteByToken,
  revokeCampaignInvite,
  sendCampaignInvite,
  shareCampaignInviteLink,
} from './campaign-invite.service'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import { computeInviteExpiresAt } from './campaign-invite.lib'
import { createInviteRecord } from './campaign-invite.repository'

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
  vi.restoreAllMocks()
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
      { returnDocument: 'after' },
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

  it('resolves and accepts invite creating membership', async () => {
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
      deliveryStatus: 'sent',
      sentAt: expect.any(String),
    })
  })

  it('shares a new invite link for pending invites', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const { id: campaignId, owner } = await makeTestCampaign()

    const sent = await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    const firstToken = extractInviteTokenFromEmail(getFakeEmailSentMessages()[0]?.text ?? '')
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 61_000)
    const result = await shareCampaignInviteLink({
      campaignId,
      inviteId: sent.invite.id,
      invitedByUserId: owner.id,
      provider,
    })

    const secondToken = extractInviteTokenFromEmail(getFakeEmailSentMessages()[1]?.text ?? '')
    expect(result.inviteUrl).toContain(secondToken)
    expect(secondToken).not.toBe(firstToken)

    await expect(resolveCampaignInviteByToken(firstToken)).rejects.toMatchObject({
      status: 404,
    })
    await expect(resolveCampaignInviteByToken(secondToken)).resolves.toMatchObject({
      status: 'pending',
    })
  })

  it('revokes pending invites and invalidates the token', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const { id: campaignId, owner } = await makeTestCampaign()

    const sent = await sendCampaignInvite({
      campaignId,
      email: 'player@example.com',
      invitedByUserId: owner.id,
      provider,
    })
    const rawToken = extractInviteTokenFromEmail(getFakeEmailSentMessages()[0]?.text ?? '')

    await revokeCampaignInvite({
      campaignId,
      inviteId: sent.invite.id,
      revokedByUserId: owner.id,
    })

    const invites = await listCampaignInvitesForOverview(campaignId)
    expect(invites).toHaveLength(0)

    const revokedInvite = await CampaignInviteModel.findById(sent.invite.id).lean()
    expect(revokedInvite?.status).toBe('revoked')

    await expect(resolveCampaignInviteByToken(rawToken)).rejects.toMatchObject({
      status: 404,
    })
  })

  it('rejects revoke for accepted invites', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'accepted-revoke@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'accepted-revoke@example.com',
      normalizedEmail: 'accepted-revoke@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    await expect(
      revokeCampaignInvite({
        campaignId,
        inviteId: invite.id,
        revokedByUserId: owner.id,
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('rejects revoke for completed invites', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'player@example.com' })
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

    await CampaignInviteModel.findByIdAndUpdate(invite.id, {
      status: 'completed',
      completedCharacterId: 'char-1',
      completedAt: new Date(),
    })

    await expect(
      revokeCampaignInvite({
        campaignId,
        inviteId: invite.id,
        revokedByUserId: owner.id,
      }),
    ).rejects.toMatchObject({ status: 409 })
  })
})
