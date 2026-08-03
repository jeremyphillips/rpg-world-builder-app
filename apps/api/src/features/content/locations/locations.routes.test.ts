import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()

describe('location content routes', () => {
  it('supports create, list, update, duplication, and delete for a simple hierarchy', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'faerun',
        kind: 'world',
        name: 'Faerûn',
      })
      .expect(201)

    const world = worldRes.body.locations
    expect(world).toMatchObject({
      kind: 'world',
      name: 'Faerûn',
      source: 'homebrew',
      status: 'published',
    })

    const regionRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'sword-coast',
        kind: 'region',
        name: 'Sword Coast',
        classification: { kind: 'geographic', type: 'coast' },
        parentLocationId: world.id,
      })
      .expect(201)

    const region = regionRes.body.locations
    expect(region.parentLocationId).toBe(world.id)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
    expect(listRes.body.locations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: world.id }),
        expect.objectContaining({ id: region.id }),
      ]),
    )

    const updateRes = await agent
      .patch(`/api/campaigns/${campaignId}/content/locations/${region.id}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'region', description: 'Western Faerûn.' })
      .expect(200)
    expect(updateRes.body.locations).toMatchObject({
      description: 'Western Faerûn.',
    })

    const duplicateRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations/${region.id}/duplicate`)
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Sword Coast Copy' })
      .expect(201)
    expect(duplicateRes.body.locations).toMatchObject({
      name: 'Sword Coast Copy',
      kind: 'region',
      status: 'draft',
    })

    await agent
      .delete(`/api/campaigns/${campaignId}/content/locations/${duplicateRes.body.locations.id}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)
  })

  it('rejects invalid parent kind pairings on publish', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'lone-world',
        kind: 'world',
        name: 'Lone World',
      })
      .expect(201)

    const regionRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'lone-region',
        kind: 'region',
        name: 'Lone Region',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'invalid-tower',
        kind: 'structure',
        name: 'Invalid Tower',
        parentLocationId: regionRes.body.locations.id,
      })
      .expect(400)
  })

  it('allows incomplete drafts without parent or kind-specific fields', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'unfinished-site',
        kind: 'site',
        name: '',
        status: 'draft',
      })
      .expect(201)

    expect(createRes.body.locations).toMatchObject({
      kind: 'site',
      status: 'draft',
    })
    expect(createRes.body.locations.parentLocationId).toBeUndefined()
  })
})
