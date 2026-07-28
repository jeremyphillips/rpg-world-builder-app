import type { Express } from 'express'
import type { Agent } from 'supertest'

import { CampaignMembershipModel } from '../../features/campaign/campaign-membership.model'
import { registerAndLoginTestUser } from '../auth-agent'

export async function registerCampaignMember(
  app: Express,
  {
    campaignId,
    email,
    campaignRole,
    controlledCharacterIds = [],
    displayName = 'Campaign Member',
    password = 'supersecret',
  }: {
    campaignId: string
    email: string
    campaignRole: 'pc' | 'observer'
    controlledCharacterIds?: string[]
    displayName?: string
    password?: string
  },
): Promise<{ agent: Agent; csrfToken: string; userId: string }> {
  const { agent, csrfToken, userId } = await registerAndLoginTestUser(app, {
    email,
    password,
    displayName,
  })

  await CampaignMembershipModel.create({
    campaignId,
    userId,
    campaignRole,
    controlledCharacterIds,
    invitedAt: new Date(),
    joinedAt: new Date(),
  })

  return { agent, csrfToken, userId }
}
