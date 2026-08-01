import { describe, expect, it } from 'vitest'

import { createInviteRecord } from './campaign-invite.repository'
import { listPendingCampaignInvitesForUser } from './list-pending-campaign-invites.service'
import { computeInviteExpiresAt } from './campaign-invite.lib'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { makeTestUser } from '../../test/fixtures/users'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../test/setup/integration-db'

useIntegrationDb()

describe('listPendingCampaignInvitesForUser', () => {
  it('returns pending invites with campaign and inviter display fields', async () => {
    const player = await makeTestUser({ email: 'mine-player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Stormwatch' })

    await createInviteRecord({
      campaignId,
      email: 'mine-player@example.com',
      normalizedEmail: 'mine-player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    const invites = await listPendingCampaignInvitesForUser(player.id, player.email)

    expect(invites).toEqual([
      expect.objectContaining({
        campaignId,
        campaignName: 'Stormwatch',
        inviterDisplayName: owner.displayName,
      }),
    ])
  })

  it('excludes invites for campaigns the user already belongs to', async () => {
    const player = await makeTestUser({ email: 'member-player@example.com' })
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
      email: 'member-player@example.com',
      normalizedEmail: 'member-player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    const invites = await listPendingCampaignInvitesForUser(player.id, player.email)
    expect(invites).toEqual([])
  })

  it('omits expired pending invites', async () => {
    const player = await makeTestUser({ email: 'expired-player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign()

    await createInviteRecord({
      campaignId,
      email: 'expired-player@example.com',
      normalizedEmail: 'expired-player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      invitedByUserId: owner.id,
    })

    const invites = await listPendingCampaignInvitesForUser(player.id, player.email)
    expect(invites).toEqual([])
  })
})
