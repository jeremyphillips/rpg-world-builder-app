import { describe, expect, it } from 'vitest'
import type { Agent } from 'supertest'

import { HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS } from '@rpg/contracts'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp())
}

describe('homebrew routes', () => {
  it('returns the homebrew content summary for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const summaryRes = await agent
      .get(`/api/campaigns/${campaignId}/homebrew/summary`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(summaryRes.body.summary.content).toHaveLength(HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS.length)
  })
})
