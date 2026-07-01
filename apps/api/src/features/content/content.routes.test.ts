import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp())
}

describe('content list routes', () => {
  it('returns resolved classes for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/classes`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.classes)).toBe(true)
    expect(res.body.classes.length).toBeGreaterThan(0)
  })

  it('returns resolved spells with the registry response key', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/spells`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.spells)).toBe(true)
    expect(res.body.spells.length).toBeGreaterThan(0)
  })

  it('returns skill proficiencies under the camelCase response key', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/skill-proficiencies`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.skillProficiencies)).toBe(true)
    expect(res.body.skillProficiencies.length).toBeGreaterThan(0)
  })

  it('returns catalog subclasses for a system class', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/classes/srd-cc-5.2.1:fighter/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(Array.isArray(res.body.subclasses)).toBe(true)
    expect(res.body.subclasses.length).toBeGreaterThan(0)
  })

  it('returns 404 for unknown content types', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    await agent
      .get(`/api/campaigns/${campaignId}/content/not-a-type`)
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })

  it('requires authentication for content reads', async () => {
    await request(getApp())
      .get('/api/campaigns/000000000000000000000000/content/classes')
      .expect(401)
  })
})
