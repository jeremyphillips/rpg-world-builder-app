import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()

const minimalOrganizationInput = {
  slug: 'emerald-concord',
  name: 'Emerald Concord',
  organizationKind: 'political',
} as const

describe('organization content routes', () => {
  it('supports create, list, update, duplication, availability, and delete', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalOrganizationInput)
      .expect(201)

    const organization = createRes.body.organizations
    expect(organization).toMatchObject({
      name: 'Emerald Concord',
      organizationKind: 'political',
      source: 'homebrew',
      status: 'published',
    })

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
    expect(listRes.body.organizations).toEqual([expect.objectContaining({ id: organization.id })])

    const updateRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/organizations/${organization.id}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationKind: 'academic', description: 'A learned society.' })
      .expect(200)
    expect(updateRes.body.organizations).toMatchObject({
      organizationKind: 'academic',
      description: 'A learned society.',
    })

    const duplicateRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations/${organization.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Emerald Concord Chapter' })
      .expect(201)
    expect(duplicateRes.body.organizations).toMatchObject({
      name: 'Emerald Concord Chapter',
      organizationKind: 'academic',
      status: 'draft',
    })

    await agent
      .patch(
        `/api/campaigns/${campaignId}/content/organizations/${organization.id}/campaign-access`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({
        available: false,
        visibilityMode: 'dm_only',
        participantIds: [],
      })
      .expect(200)

    await agent
      .delete(`/api/campaigns/${campaignId}/content/organizations/${organization.id}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
  })

  it('allows incomplete drafts but requires organization kind to publish', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'unfinished-order', name: '', status: 'draft' })
      .expect(201)

    const organizationId = createRes.body.organizations.id as string
    expect(createRes.body.organizations).toMatchObject({ status: 'draft' })
    expect(createRes.body.organizations.organizationKind).toBeUndefined()

    await agent
      .post(`/api/campaigns/${campaignId}/content/organizations/${organizationId}/publish`)
      .set(CSRF_HEADER, csrfToken)
      .expect(400)

    await agent
      .patch(`/api/campaigns/${campaignId}/content/organizations/${organizationId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Unfinished Order', organizationKind: 'religious' })
      .expect(200)

    const publishRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations/${organizationId}/publish`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
    expect(publishRes.body.organizations.status).toBe('published')
  })
})
