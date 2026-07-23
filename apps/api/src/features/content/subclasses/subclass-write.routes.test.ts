import { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()
const FIGHTER_CLASS_ID = 'srd-cc-5.2.1:fighter'

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp())
}

const minimalSubclassInput = {
  slug: 'route-write-subclass',
  name: 'Route Write Subclass',
  classId: FIGHTER_CLASS_ID,
  tagline: 'A test subclass',
  features: [{ kind: 'custom', id: 'feature-1', name: 'Test Feature', level: 3 }],
}

describe('subclass write routes', () => {
  it('creates homebrew subclass, patches system subclass, toggles availability, and clears via reload', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSubclassInput)
      .expect(201)

    const entityId = createRes.body.subclasses.id as string
    expect(createRes.body.subclasses.source).toBe('homebrew')
    expect(createRes.body.subclasses.classId).toBe(FIGHTER_CLASS_ID)

    const listAfterCreate = await agent
      .get(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(
      listAfterCreate.body.subclasses.find((row: { id: string }) => row.id === entityId)?.name,
    ).toBe('Route Write Subclass')
    expect(
      listAfterCreate.body.subclasses.find((row: { id: string }) => row.id === entityId)
        ?.activeInCampaign,
    ).toBe(true)

    const patchRes = await agent
      .patch(
        `/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses/${entityId}`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Updated Route Write Subclass' })
      .expect(200)

    expect(patchRes.body.subclasses.name).toBe('Updated Route Write Subclass')

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const champion = listRes.body.subclasses.find(
      (row: { slug: string }) => row.slug === 'champion',
    )
    expect(champion).toBeDefined()

    const systemPatchRes = await agent
      .patch(
        `/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses/${champion.id}`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({ tagline: 'Patched Champion Tagline' })
      .expect(200)

    expect(systemPatchRes.body.subclasses.tagline).toBe('Patched Champion Tagline')

    const availabilityRes = await agent
      .patch(
        `/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses/${champion.id}/availability`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({ activeInCampaign: false })
      .expect(200)

    expect(availabilityRes.body.availability.activeInCampaign).toBe(false)

    const reloadRes = await agent
      .get(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const reloadedChampion = reloadRes.body.subclasses.find(
      (row: { id: string }) => row.id === champion.id,
    )
    expect(reloadedChampion.activeInCampaign).toBe(false)
    expect(reloadedChampion.tagline).toBe('Patched Champion Tagline')
  })

  it('returns blocked delete when a character references the homebrew subclass', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSubclassInput)
      .expect(201)

    const entityId = createRes.body.subclasses.id as string

    await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        name: 'Blocking NPC',
        classes: [{ classId: FIGHTER_CLASS_ID, level: 3, subclassId: entityId }],
      })
      .expect(201)

    const res = await agent
      .delete(
        `/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses/${entityId}`,
      )
      .set(CSRF_HEADER, csrfToken)
      .expect(409)

    expect(res.body.result.status).toBe('blocked')
    expect(Array.isArray(res.body.result.blockers)).toBe(true)
  })

  it('returns deletion availability for a homebrew subclass', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSubclassInput)
      .expect(201)

    const entityId = createRes.body.subclasses.id as string

    const res = await agent
      .get(
        `/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses/${entityId}/deletion-availability`,
      )
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.availability).toEqual({ status: 'allowed' })
  })

  it('rejects PATCH when body classId does not match the route', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalSubclassInput)
      .expect(201)

    const entityId = createRes.body.subclasses.id as string

    await agent
      .patch(
        `/api/campaigns/${campaignId}/content/classes/${FIGHTER_CLASS_ID}/subclasses/${entityId}`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({ classId: 'srd-cc-5.2.1:wizard', name: 'Mismatch' })
      .expect(400)
  })
})
