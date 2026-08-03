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

  it('persists Model E building classification variants', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'model-e-world', kind: 'world', name: 'Model E World' })
      .expect(201)

    const settlementRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'model-e-settlement',
        kind: 'settlement',
        name: 'Model E Settlement',
        settlementType: 'city',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    const parentId = settlementRes.body.locations.id

    const archetypeOnlyRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'yawning-portal',
        kind: 'structure',
        name: 'Yawning Portal',
        structureType: 'building',
        classification: { archetype: 'tavern' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(archetypeOnlyRes.body.locations.classification).toEqual({ archetype: 'tavern' })

    const specializationRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'coaching-inn',
        kind: 'structure',
        name: 'Coaching Inn',
        structureType: 'building',
        classification: { archetype: 'inn', specialization: 'Coaching inn' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(specializationRes.body.locations.classification).toEqual({
      archetype: 'inn',
      specialization: 'Coaching inn',
    })

    const overrideRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'healing-temple',
        kind: 'structure',
        name: 'Healing Temple',
        structureType: 'building',
        classification: { archetype: 'temple', functionOverride: 'care' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(overrideRes.body.locations.classification).toEqual({
      archetype: 'temple',
      functionOverride: 'care',
    })

    const manifestationRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'desert-rest',
        kind: 'structure',
        name: 'Desert Rest',
        structureType: 'building',
        classification: { archetype: 'caravanserai' },
        parentLocationId: parentId,
      })
      .expect(201)
    expect(manifestationRes.body.locations.classification).toEqual({ archetype: 'caravanserai' })

    const unclassifiedRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'unfinished-hall',
        kind: 'structure',
        name: 'Unfinished Hall',
        structureType: 'building',
        parentLocationId: parentId,
      })
      .expect(201)
    expect(unclassifiedRes.body.locations.classification).toBeUndefined()
  })

  it('rejects invalid Model E building classification values', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const worldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ slug: 'reject-world', kind: 'world', name: 'Reject World' })
      .expect(201)

    const settlementRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'reject-settlement',
        kind: 'settlement',
        name: 'Reject Settlement',
        settlementType: 'town',
        parentLocationId: worldRes.body.locations.id,
      })
      .expect(201)

    const parentId = settlementRes.body.locations.id

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'bad-archetype',
        kind: 'structure',
        name: 'Bad Archetype',
        structureType: 'building',
        classification: { archetype: 'not_an_archetype' },
        parentLocationId: parentId,
      })
      .expect(400)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'bad-override',
        kind: 'structure',
        name: 'Bad Override',
        structureType: 'building',
        classification: { archetype: 'temple', functionOverride: 'not_a_function' },
        parentLocationId: parentId,
      })
      .expect(400)

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'fort-with-classification',
        kind: 'structure',
        name: 'Fort With Classification',
        structureType: 'fortification',
        classification: { archetype: 'tavern' },
        parentLocationId: parentId,
      })
      .expect(400)
  })
})
