import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { minimalNpcRequestInput } from '../../test/fixtures/npcs'
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

describe('content delete routes', () => {
  const minimalSpeciesInput = {
    slug: 'route-delete-folk',
    name: 'Route Delete Folk',
    creatureType: 'humanoid',
    sizes: ['medium'],
    movement: { walk: 30 },
    traits: [],
  }

  it('returns deletion availability for homebrew content', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/species`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpeciesInput)
      .expect(201)

    const entityId = createRes.body.species.id as string

    const res = await agent
      .get(`/api/campaigns/${campaignId}/content/species/${entityId}/deletion-availability`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.availability).toEqual({ status: 'allowed' })
  })

  it('deletes homebrew content and returns deleted result', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/species`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpeciesInput)
      .expect(201)

    const entityId = createRes.body.species.id as string

    const res = await agent
      .delete(`/api/campaigns/${campaignId}/content/species/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.result).toEqual({ status: 'deleted' })
  })

  it('returns blocked result shape on DELETE when usage exists', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/species`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSpeciesInput)
      .expect(201)

    const entityId = createRes.body.species.id as string

    await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        name: 'Blocking NPC',
        species: { id: entityId },
      })
      .expect(201)

    const res = await agent
      .delete(`/api/campaigns/${campaignId}/content/species/${entityId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(409)

    expect(res.body.result.status).toBe('blocked')
    expect(Array.isArray(res.body.result.blockers)).toBe(true)
  })
})
