import { describe, expect, it } from 'vitest'

import { createPcRecord } from '../character/character.repository'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { assignPcToCampaignMember } from '../../test/helpers/campaign-participation'
import { addControlledCharacterToMembership } from './participation/assign-controlled-pc.service'
import { CampaignMembershipModel } from './campaign-membership.model'
import {
  listCampaignMembersForOverview,
  listCampaignPartyForOverview,
} from './campaign-overview.service'
import { createOrConfirmPlayerMembership } from '../campaign-invite/create-or-confirm-player-membership'

describe('campaign overview service', () => {
  it('lists members with onboarding state derived from controlled characters', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({
      name: 'Overview Campaign',
      owner: await makeTestUser({ email: 'overview-owner@example.com', displayName: 'Owner' }),
    })
    const player = await makeTestUser({
      email: 'overview-player@example.com',
      displayName: 'Player',
    })

    await createOrConfirmPlayerMembership({
      campaignId,
      userId: player.id,
      joinedAt: new Date(),
    })

    const members = await listCampaignMembersForOverview(campaignId)

    expect(members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayName: owner.displayName,
          role: 'owner',
        }),
        expect.objectContaining({
          displayName: 'Player',
          role: 'pc',
          onboardingState: 'onboarding_incomplete',
          inviteAcceptedAt: expect.any(String),
        }),
      ]),
    )
  })

  it('omits character_added when a PC has control without open participation', async () => {
    const { id: campaignId } = await makeTestCampaign({
      name: 'Inconsistent Control Campaign',
      owner: await makeTestUser({
        email: 'inconsistent-owner@example.com',
        displayName: 'Inconsistent Owner',
      }),
    })
    const player = await makeTestUser({
      email: 'inconsistent-player@example.com',
      displayName: 'Inconsistent Player',
    })
    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    await createOrConfirmPlayerMembership({
      campaignId,
      userId: player.id,
      joinedAt: new Date(),
    })

    const membership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    await addControlledCharacterToMembership({
      membershipId: String(membership!._id),
      characterId: character.id,
    })

    const members = await listCampaignMembersForOverview(campaignId)
    const playerMember = members.find((member) => member.displayName === 'Inconsistent Player')

    expect(playerMember).toMatchObject({
      role: 'pc',
      onboardingState: undefined,
    })
  })

  it('excludes the requesting viewer from the members list', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({
      name: 'Viewer Filter Campaign',
      owner: await makeTestUser({ email: 'viewer-owner@example.com', displayName: 'Owner' }),
    })
    const player = await makeTestUser({
      email: 'viewer-player@example.com',
      displayName: 'Player',
    })

    await createOrConfirmPlayerMembership({
      campaignId,
      userId: player.id,
      joinedAt: new Date(),
    })

    const membersForPlayer = await listCampaignMembersForOverview(campaignId, {
      excludeUserId: player.id,
    })

    expect(membersForPlayer).toEqual([
      expect.objectContaining({
        displayName: owner.displayName,
        role: 'owner',
      }),
    ])
    expect(membersForPlayer.some((member) => member.displayName === 'Player')).toBe(false)
  })

  it('lists party PCs with controlling member metadata', async () => {
    const { id: campaignId } = await makeTestCampaign({
      name: 'Party Campaign',
      owner: await makeTestUser({ email: 'party-owner@example.com', displayName: 'Party Owner' }),
    })
    const player = await makeTestUser({
      email: 'party-player@example.com',
      displayName: 'Party Player',
    })
    const character = await createPcRecord(minimalStandalonePcInput, player.id)

    await createOrConfirmPlayerMembership({
      campaignId,
      userId: player.id,
      joinedAt: new Date(),
    })

    const membership = await CampaignMembershipModel.findOne({
      campaignId,
      userId: player.id,
    }).lean()
    await assignPcToCampaignMember({
      campaignId,
      membershipId: String(membership!._id),
      characterId: character.id,
    })

    const party = await listCampaignPartyForOverview(campaignId)

    expect(party).toHaveLength(1)
    expect(party[0]).toMatchObject({
      character: {
        id: character.id,
        name: character.name,
        campaign: { id: campaignId, name: 'Party Campaign' },
      },
      member: {
        displayName: 'Party Player',
      },
      roster: { status: 'active' },
    })
  })
})
