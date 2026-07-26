import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { CampaignMembershipModel } from '../../campaign/campaign-membership.model'
import { attachCharacterToCampaign } from '../../campaign/participation/campaign-character-participation.repository'
import { createPcRecord } from '../../character/character.repository'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()

describe('campaign access participants route', () => {
  it('returns submitted campaign PCs for managers', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'roster-owner@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const pc = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Roster Fighter' },
      (await owner.agent.get('/api/auth/me').set(CSRF_HEADER, owner.csrfToken).expect(200)).body
        .user.id as string,
    )

    await attachCharacterToCampaign({
      campaignId,
      characterId: pc.id,
      joinedAt: new Date().toISOString(),
    })

    const res = await owner.agent
      .get(`/api/campaigns/${campaignId}/content/access-participants`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    expect(res.body.participants).toEqual([
      {
        id: pc.id,
        name: 'Roster Fighter',
        playerDisplayName: 'Campaign Owner',
      },
    ])
  })

  it('rejects non-manager campaign members', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'roster-owner-deny@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const member = await registerAndLoginTestUser(getApp(), {
      email: 'roster-member@example.com',
      password: 'supersecret',
      displayName: 'Member',
    })
    const meRes = await member.agent
      .get('/api/auth/me')
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)
    await CampaignMembershipModel.create({
      campaignId,
      userId: meRes.body.user.id as string,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    await member.agent
      .get(`/api/campaigns/${campaignId}/content/access-participants`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(403)
  })
})
