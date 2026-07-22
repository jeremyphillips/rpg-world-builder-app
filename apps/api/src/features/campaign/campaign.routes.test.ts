import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'

function registerTemplateTestUser(email: string) {
  return registerAndLoginTestUser(getApp(), {
    email,
    password: TEST_PASSWORD,
    displayName: 'Template Tester',
  })
}

describe('campaign template routes', () => {
  it('lists shipped templates for an authenticated user', async () => {
    const { agent } = await registerTemplateTestUser('template-list@example.com')

    const response = await agent.get('/api/campaigns/templates').expect(200)

    expect(response.body.campaignTemplates).toMatchObject([
      {
        metadata: { id: 'classic-adventure', version: '1.0.0' },
        rulesetId: 'srd-cc-5.2.1',
      },
    ])
  })

  it('creates a campaign from a selected template', async () => {
    const { agent, csrfToken } = await registerTemplateTestUser('template-create@example.com')

    const response = await agent
      .post('/api/campaigns')
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'The Argent Road', campaignTemplateId: 'classic-adventure' })
      .expect(201)

    expect(response.body.campaign).toMatchObject({
      identity: { name: 'The Argent Road' },
      configuration: {
        flavor: {
          mood: ['heroic', 'hopeful'],
          magicLevel: 'standard_fantasy',
        },
      },
    })
  })

  it('returns a client error for an unknown template', async () => {
    const { agent, csrfToken } = await registerTemplateTestUser('template-missing@example.com')

    const response = await agent
      .post('/api/campaigns')
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Unknown', campaignTemplateId: 'missing' })
      .expect(400)

    expect(response.body.error).toMatchObject({ code: 'bad_request' })
  })

  it('requires authentication to list templates', async () => {
    await request(getApp()).get('/api/campaigns/templates').expect(401)
  })
})
