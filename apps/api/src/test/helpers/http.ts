import type { Agent, Test } from 'supertest'
import type { Express } from 'express'

import type {
  UpdateCampaignCharacterCreationInput,
  UpdateCampaignMechanicsInput,
} from '@rpg/contracts'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../auth-agent'

export type AuthedCampaignContext = {
  agent: Agent
  csrfToken: string
  campaignId: string
}

/** Registers a user, logs in, and creates a campaign for route smoke tests. */
export async function authedCampaignContext(app: Express): Promise<AuthedCampaignContext> {
  const { agent, csrfToken } = await registerAndLoginTestUser(app)
  const campaignId = await createTestCampaign(agent, csrfToken)

  return { agent, csrfToken, campaignId }
}

export function getRulesetPatchRoute(agent: Agent, csrfToken: string, campaignId: string): Test {
  return agent.get(`/api/campaigns/${campaignId}/ruleset-patch`).set(CSRF_HEADER, csrfToken)
}

export function patchCharacterCreationRoute(
  agent: Agent,
  csrfToken: string,
  campaignId: string,
  body: UpdateCampaignCharacterCreationInput,
): Test {
  return agent
    .patch(`/api/campaigns/${campaignId}/ruleset-patch/character-creation`)
    .set(CSRF_HEADER, csrfToken)
    .send(body)
}

export function patchMechanicsRoute(
  agent: Agent,
  csrfToken: string,
  campaignId: string,
  body: UpdateCampaignMechanicsInput,
): Test {
  return agent
    .patch(`/api/campaigns/${campaignId}/ruleset-patch/mechanics`)
    .set(CSRF_HEADER, csrfToken)
    .send(body)
}
