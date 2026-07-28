import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { acceptCampaignInvite } from '../campaign-invite/campaign-invite.service'
import { CampaignInviteModel } from '../campaign-invite/campaign-invite.model'
import { computeInviteExpiresAt } from '../campaign-invite/campaign-invite.lib'
import { createInviteRecord } from '../campaign-invite/campaign-invite.repository'
import { generateInviteToken, hashInviteToken } from '../campaign-invite/campaign-invite-token'
import { createOrConfirmPlayerMembership } from '../campaign/participation/create-or-confirm-player-membership'
import { CampaignMembershipModel } from './campaign-membership.model'
import { removeIncompleteCampaignMember } from './remove-incomplete-campaign-member.service'

useIntegrationDb()

describe('removeIncompleteCampaignMember', () => {
  it('removes an incomplete PC membership and revokes their accepted invite', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'remove-player@example.com' })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: player.email,
      normalizedEmail: player.email.toLowerCase(),
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

    await removeIncompleteCampaignMember({
      campaignId,
      membershipId: String(membership!._id),
      removedByUserId: owner.id,
    })

    const remainingMembership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    expect(remainingMembership).toBeNull()

    const revokedInvite = await CampaignInviteModel.findById(invite.id).lean()
    expect(revokedInvite?.status).toBe('revoked')
  })

  it('rejects removal when the member already controls a character', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const player = await makeTestUser({ email: 'active-player@example.com' })

    await createOrConfirmPlayerMembership({
      campaignId,
      userId: player.id,
      joinedAt: new Date(),
      sourceInviteId: 'test-source-invite',
    })

    const membership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    await CampaignMembershipModel.updateOne(
      { _id: membership!._id },
      { $set: { controlledCharacterIds: ['char_1'] } },
    )

    await expect(
      removeIncompleteCampaignMember({
        campaignId,
        membershipId: String(membership!._id),
        removedByUserId: owner.id,
      }),
    ).rejects.toMatchObject({ status: 409 })
  })
})
